import { useCallback, useEffect, useRef, useState } from 'react';
import { useUnmount } from '../../hooks/useUnmount.js';
import styles from '../../styles/Editor/Editor.module.css';
import Note from '../../scripts/notes/note.js';
import EditorConnection from './EditorConnection';
import AddConnection from './AddConnection';
import { binarySearch, binaryInsert } from '../../scripts/utility/utility';
import { createNoteOnBack } from '../../services/axios.js';
import { useUser } from '../../context/user.js';
import { useNotebox } from '../../context/notebox.js';
import { useNoteGraph } from '../../context/noteGraph.js';
import { useSelected } from '../../context/selected.js';
import { useNotebooks } from '../../context/notebooks.js';
import { useNavigate } from 'react-router-dom';

const AUTOMATIC_SAVING = false;

const notebookIcon = require("../../resources/notebook.png");

const noteTypeDescriptions = {
	main: "Appears as a note that connections circle around on the Wall.",
	sticky: 'Appears only when connected to another "Main" note type.',
}

const Editor = () => {
	const { graph, addNote, updateNote, addConnectionsToNote, updateConnectionsOfNote, setGraph } = useNoteGraph();
	const { notebooks, createNotebook, getNotebookName } = useNotebooks();
	const { selected, setSelectedNote, isSelectedNoteEdited, newNoteId } = useSelected();
	const { note: selectedNote, index: selectedIndex } = selected;
	const { isPinned: isNoteboxPinned } = useNotebox();

	const [noteInEditor, setNoteInEditor] = useState(new Note());
	const [noteInEditorIndex, setNoteInEditorIndex] = useState(-1);

	const [notebookName, setNotebookName] = useState('');
	const [connections, setConnections] = useState([]);

	const [initialGraphValues, setInitialGraphValues] = useState({ 
		loadedSize: false, 
		highestId: 0, 
		notesAdded: 0 
	});

	const dataListRef = useRef(null);
	const notebookRef = useRef(null)
	const titleRef = useRef(null);
	const textRef = useRef(null);

	const navigate = useNavigate()

	useEffect(() => { // Stores the loading graph values for better performance in algorithms
		// Skips component first mounting
		if (initialGraphValues.loadedSize === false && graph.size() === 0) {
			setInitialGraphValues({ loadedSize: true, highestId: 0, notesAdded: 0 });

		// Initializes values
		} else if (typeof initialGraphValues.loadedSize === 'boolean') {

			const navigatedFromCreateButton = graph.getVertex(graph.size() - 1)?.id === -1;
			const origSize = navigatedFromCreateButton ? graph.size() - 1 : graph.size();

			setInitialGraphValues({ 
				loadedSize: origSize, 
				highestId: (origSize === 0) ? 0 : graph.getVertex(origSize - 1).id,
				notesAdded: 0,
			});

		// Updates loadedSize when notes are removed from graph
		} else if (initialGraphValues.loadedSize !== 0 && 
			graph.getVertex(initialGraphValues.loadedSize - 1)?.id !== initialGraphValues.highestId) {

			let size = initialGraphValues.loadedSize;
			while (graph.getVertex(size - 1)?.id !== initialGraphValues.highestId && size >= 0) {
				size -= 1;
			}
			setInitialGraphValues({ 
				loadedSize: size, 
				highestId: initialGraphValues.highestId, 
				notesAdded: initialGraphValues.notesAdded 
			});
		}
	}, [graph]);

	useEffect(() => { // Updates editor values when a different note is selected
		const { id, title, text, quotes, idNotebook, main, dateCreated, allNotesPosition, point } = selectedNote ?? {};
		setNoteInEditor(new Note(
			id ?? null,
			title ?? '',
			text ?? '',
			quotes ?? '',
			idNotebook ?? null,
			main ?? false,
			dateCreated ?? 'No Date',
			allNotesPosition ?? null,
			point,
		));
		setNoteInEditorIndex(selectedIndex);
		setNotebookName(getNotebookName(selectedNote?.idNotebook) ?? '');
		setConnections(graph.getVertexNeighbors(selectedIndex) ?? []); // Format - [ { v: { id: _ } weight: _ }, etc. ]
	}, [selectedNote, selectedIndex, dataListRef, getNotebookName, graph]);

	useEffect(() => { // Marks note as unsaved if connections have changed
		if (initialGraphValues.loadedSize !== false) {
			onInputChange();
		}
	}, [connections]);

	useEffect(() => {
		if (!isNoteboxPinned) {
			notebookRef.current.focus();
		}
	}, [newNoteId, isNoteboxPinned]);

	// Determines connections to add and remove to backend: O(n)
	const getAddedAndRemovedConnections = useCallback((prevConns) => {
		const newConns = [], removeConns = [];
		let connIndex = 0, prevIndex = 0; // Iterates 0 upwards
		while (prevConns[prevIndex] || connections[connIndex]) {

			// Assigns MAX_VALUE if prevConns are iterated through
			const prevVal = prevConns[prevIndex]?.v.id ?? Number.MAX_VALUE;

			// Adds all new connection ids that are lower than next previous connection id
			while (connections[connIndex]?.v.id < prevVal) {
				newConns.push(connections[connIndex].v.id);
				connIndex++;
			}

			// If previous connection not found in updated connection list after iterating up to its id, 
			// determines removed
			if (connections[connIndex]?.v.id !== prevVal && prevVal !== Number.MAX_VALUE) {
				removeConns.push(prevConns[prevIndex].v.id);
			} else if (connections[connIndex]?.v.id === prevVal) {
				connIndex++;
			}
			prevIndex++;
		}

		return [newConns, removeConns];
	}, [connections])

	const noteChanged = useCallback((updated = {}) => {
		const vertex = graph.getVertex(noteInEditorIndex);
		if (!vertex) {
			console.warn(`The Editor's original note for comparing is null. noteInEditorIndex: ${noteInEditorIndex}`);
		}
		const originalNote = Note.from(vertex);
		const newNote = Object.assign({ ...noteInEditor }, updated);
		return !originalNote.equals(newNote);
	}, [graph, noteInEditor, noteInEditorIndex])

	const connectionChanged = useCallback(() => {
		const prevConns = graph.getVertexNeighbors(noteInEditorIndex);
		return !(getAddedAndRemovedConnections(prevConns).every(conns => conns.length === 0));
	}, [getAddedAndRemovedConnections, graph, noteInEditorIndex])

	const isEditorChanged = useCallback((updated = {}) => {
		return noteChanged(updated) || connectionChanged();
	}, [connectionChanged, noteChanged])

	const handleSubmit = useCallback(async (e) => {

		console.log('handle submit');

		// Determines notebook id if existent
		let { id: notebookId } = notebooks.find((nb) => nb.name === notebookName) || { id: null };

		const updated = { idNotebook: notebookId };
		const hasChanged = isEditorChanged(updated);

		if (hasChanged && !e) { // Changes made and diff note selected or connections have changed
			if (!AUTOMATIC_SAVING && !window.confirm(`Would you like to save note '${noteInEditor.title}'?`)) {
				isSelectedNoteEdited(false);
				return false;
			}
		} else if (!hasChanged && !e) { // No changes made and different note selected
			return false;
		}

		// create notebook if non-existant
		if (notebookName && notebookId === null) {
			if (!window.confirm("Create notebook '" + notebookName + "'?")) {
				alert("Please enter the name of an existing notebook "
					+ "or blank to select no notebook");
				return false;
			} else { // Creates the new Notebook
				await createNotebook(notebookName);
			}
		}

		let updatingNote = { 
			...noteInEditor, 
			idNotebook: notebookId ? Number(notebookId) : null,
		};

		// UNTESTED
		if (selectedNote?.id < 0) { // Adding a note
			console.log('adding a note')

			const createdNote = await addNote(updatingNote);
			await addConnectionsToNote(createdNote, connections);
			setInitialGraphValues(prev => ({ ...prev, notesAdded: ++prev.notesAdded }));

			// Only updates editor states if button clicked (not if other note selected)
			if (e) {
				setNoteInEditor(createdNote);
				setSelectedNote(createdNote, selectedIndex);
			}

		// Updating a note
		} else {
			// Only updates if button clicked (not other note selected)
			if (e) {
				setNoteInEditor(updatingNote); 
				setSelectedNote(updatingNote, selectedIndex);
			}

			try {
				await updateNote(updatingNote);

				// Gets the connections that were added and removed
				const prevConns = graph.getVertexNeighbors(updatingNote);
				const [newConns, removeConns] = getAddedAndRemovedConnections(prevConns);
				await updateConnectionsOfNote(updatingNote.id, newConns, removeConns);
			} catch (e) {
				console.log('e', e);
			}
		}
	}, [notebooks, isEditorChanged, notebookName, noteInEditor, selectedNote?.id, isSelectedNoteEdited, createNotebook, addNote, addConnectionsToNote, connections, setSelectedNote, selectedIndex, updateNote, graph, getAddedAndRemovedConnections, updateConnectionsOfNote]);

	useUnmount(() => { // Prompts user to save note if it has been edited
		if (selected?.edited) {
			console.log('unmount submit');
			handleSubmit();
		}

		// Removes any unsaved notes: O(m + n)
		const { loadedSize } = initialGraphValues;
		if (loadedSize === false) return;

		// Removes unsaved notes from graph, and determines new graphIndices for noteOrder: 
		// O(m), where m is the number of all new notes
		const newGraph = graph.clone(), newGraphIndices = new Map();
		for (let i = loadedSize; i < newGraph.size(); i++) {
			const noteId = newGraph.getVertex(i).id;
			if (noteId < 0) {
				newGraph.removeVertex(i--);
			} else {
				newGraphIndices.set(noteId, i);
			}
		}
		
		if (selectedNote?.id < 0) {
			const firstNote = newGraph.getVertex(0);
			setSelectedNote(firstNote ?? null, firstNote ? 0 : null);
		}

		setGraph(newGraph);
	}, [selectedNote?.id]);

	const onAddConnection = (noteId, noteTitle) => {
		console.log('adding')
        setConnections(prev => binaryInsert(prev.concat(), { id: Number(noteId) }));
	};

	const onClickConnection = (e, note) => {
		const index = graph.getVertices().findIndex((n) => n.id === note.id);
		console.log(note, index);
		setSelectedNote(note, index);
	}

	const onRemoveConnection = (e, note) => {
		setConnections(prev => {
			const newConnections = prev.concat()
			const index = binarySearch(newConnections, note.id, 0, 'v.id')[1];
			newConnections.splice(index, 1);
			return newConnections;
		})
		console.log('removing')
	};

	/**
	 * Returns a note aboject in the graph from it's 'id' property:
	 * O(1), O(log initial-n), or O(m), where m is all newly created notes
	 * 
	 * @param {number} id The 'id' property of the note to find.
	 * @returns The note object, if found, and null otherwise.
	 */
	const getConnectingNote = (id) => {

		let note = false;

		if (id < 0) { // An unsaved, new note
			/* New notes are tracked by decremental negative id numbers, but added incrementally to the 
			 * graph, so its index can be found adding initial graph size to absolute of negative new note id. 
			 * O(1) */
			note = graph.getVertex(initialGraphValues.loadedSize - 1 + Math.abs(id));

		} else if (id <= initialGraphValues.highestId) { // Binary searches for note: O(log initial-n)
			let vertices = graph.getVertices();
			vertices.length = initialGraphValues.loadedSize;
			note = binarySearch(vertices, id)[0];

		} else { // Note newly created, so searches from actual graph size down to initial graph size: O(m)
			for (let i = graph.size() - 1, loadedSize = initialGraphValues.loadedSize; i >= loadedSize; i--) {
				const n = graph.getVertex(i);
				if (Number(n.id) === Number(id)) {
					note = n;
				}
			}
		}
		
		return (note !== false && note.length !== 0) ? note : null;
	}

	const selectAllText = (e) => {
		e.target.select();
		e.target.setSelectionRange(0, e.target.value.length); // For mobile safari
	};

	const onTitleKeyDown = (e) => {
		if (e.key === 'Enter') {
			textRef.current.focus(); 
			e.preventDefault();
		}
	}

	const onTextKeyDown = (e) => {
		if (e.key === 'Backspace' && e.target.value === '') {
			titleRef.current.focus();
			e.preventDefault();
		}
	}

	const onInputChange = (e) => {

		let updated = {};
		({ // Changes appropriate input state
			[styles.notebook]: () => setNotebookName(e.target.value),
			[styles.title]: () => {
				setNoteInEditor({ ...noteInEditor, title: e.target.value });
				updated = { title: e.target.value };
			},
			[styles.text]: () => {
				setNoteInEditor({ ...noteInEditor, text: e.target.value });
				updated = { text: e.target.value };
			},
			[styles.quotes]: () => {
				setNoteInEditor({ ...noteInEditor, quotes: e.target.value });
				updated = { quotes: e.target.value };
			},

		})[e?.target.id]?.();

		// Gets live value of notebookId if updated
		const nbName = (e?.target.id === styles.notebook) ? e.target.value : notebookName;
		updated.idNotebook = notebooks.find((nb) => nb.name === nbName)?.id ?? null;

		const hasChanged = isEditorChanged(updated);
		isSelectedNoteEdited(hasChanged)
	}

	const handleMinimizeIconClick = useCallback((e) => navigate('/thoughtwall'), [navigate])

	const noteListWithoutConnections = () => { // O(log n * c)

		let noteList = graph.getVertices();
		noteList.splice((selectedNote?.id < 0) 
			? initialGraphValues.loadedSize - 1 + Math.abs(selectedNote?.id) // Unsaved note: O(1)
			: binarySearch(noteList, selectedNote?.id)[1], 1); // Removes current note id: O (log n)

		for (let conn of connections) { // Removes connection ids
            const index = binarySearch(noteList, conn.v.id)[1];
            noteList.splice(index, 1);
        }

        return noteList;
    }

	function mainToggle (e) {
		setNoteInEditor(prev => {
			const newNoteInEditor = { ...prev, main: (e.target.id === 'mainRadio') ? true : false };
			const hasChanged = isEditorChanged({ main: newNoteInEditor.main });
			isSelectedNoteEdited(hasChanged)
			return newNoteInEditor;
		});
	};

    return (
        <form className={styles.form}>
			<div className={styles.notebookRow}>
				<img id={styles.notebookIcon} src={notebookIcon} alt="" />
				<input 
					ref={notebookRef}
					type="text" 
					list="notebookOptions" 
					id={styles.notebook} 
					className={styles.editorTextInputs} 
					placeholder="Notebook"
					value={notebookName}
					onChange={onInputChange}
					disabled={selectedNote === null}
				/>
				<datalist id="notebookOptions" ref={dataListRef}>
					{notebooks?.map((nb, index) => (
						<option value={nb.name} key={index}>{nb.name}</option>
					))}
				</datalist>
				<div className={styles.windowedScreenIcon} onClick={handleMinimizeIconClick} />
				{/* <Link to='/' className={`link ${styles.thoughtWallLink}`}>See In Wall</Link> */}
			</div>

			<div className={styles.editorAndConnections}>
				<div 
					id={styles.editor} 
					className={(noteInEditor.main === undefined || noteInEditor.main || selectedNote === null) 
						? styles.editorMainColor 
						: styles.editorStickyColor
					}
				>
					<div className='flex'>
					<input 
						type="text" 
						id={styles.title} 
						className={styles.editorTextInputs} 
						placeholder='Title'
						value={noteInEditor.title ?? ''}
						onChange={onInputChange}
						onKeyDown={onTitleKeyDown}
						onFocus={(e) => {if (noteInEditor.title === 'Untitled') selectAllText(e)}}
						ref={titleRef}
						disabled={selectedNote === null}
					/>
					<div id={styles.dateCreated}>
						{typeof noteInEditor?.dateCreated !== 'string'
							? new Date(noteInEditor?.dateCreated).toLocaleDateString('en-us', 
								{ month: "2-digit", day:"numeric", year: "2-digit" })
							: noteInEditor?.dateCreated
						}
					</div>
					</div>
					<textarea 
						id={styles.text} 
						className={styles.editorTextInputs} 
						placeholder="" 
						value={noteInEditor.text ?? ''}
						onChange={onInputChange}
						onKeyDown={onTextKeyDown}
						onFocus={(e) => {if (noteInEditor.text === '-') selectAllText(e)}}
						ref={textRef}
						disabled={selectedNote === null}
					/>
					<textarea 
						id={styles.quotes} 
						className={`${styles.editorTextInputs} ${noteInEditor.main ? '' : 'flex0'}`} 
						placeholder="Quotes" 
						value={noteInEditor.quotes ?? ''}
						onChange={onInputChange}
						disabled={selectedNote === null}
					/>
					<div className={styles.radioRow}>
						<input 
							type="radio" 
							className={"btn-check " + styles.radios}
							name="options-outlined" 
							id="mainRadio"
							autoComplete="off" 
							checked={noteInEditor.main || selectedNote === null} 
							onChange={mainToggle} 
							disabled={selectedNote === null}
						/>
						<label 
							className="btn" 
							id={styles.mainButton} 
							htmlFor="mainRadio" 
						>
							Main Note
						</label>

						<input 
							type="radio"
							className={"btn-check " + styles.radios}
							name="options-outlined"
							id="stickyRadio"
							autoComplete="off" 
							checked={!noteInEditor.main && selectedNote !== null} 
							onChange={mainToggle} 
							disabled={selectedNote === null}
						/>
						<label 
							className="btn" 
							id={styles.stickyButton} 
							htmlFor="stickyRadio"
						>
							Sticky Note
						</label>
					</div>
				</div>

				<div id={styles.connectionsRow}>
					{connections?.map((connectingNote, i) => !!connectingNote && (
						<EditorConnection 
							note={getConnectingNote(connectingNote?.v.id)} 
							onClick={onClickConnection}
							onRemove={onRemoveConnection}
							className={styles.connectionContainer}
							lineClassName={styles.connectionLine}
							key={connectingNote?.v.id ?? i}
						/>
					))}
					<AddConnection 
						currentNoteId={selectedNote?.id}
						noteList={noteListWithoutConnections()}
						onAddConnection={onAddConnection}
						disabled={selectedNote === null}
						className={`${styles.connectionContainer} ${styles.add}`}
						lineClassName={styles.connectionLine}
					/>
					<div id={styles.connectedToLabel}>Connections</div>
				</div>
			</div>

			<input 
				type="button" 
				id={styles.addUpdate}
				className={`${selectedNote === null ? styles.addUpdateDisabled : styles.addUpdateEnabled} button`}
				value={selectedNote === null ? 'No note' : selectedNote?.id < 0 ? "Create" : "Update"} 
				onClick={handleSubmit}
				disabled={selectedNote === null ? true : false}
			/>
        </form>
    )
};

export default Editor;