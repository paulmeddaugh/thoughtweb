import { useEffect, useRef, useState } from 'react';
import { useUnmount } from '../../hooks/useUnmount.js';
import styles from '../../styles/Editor/Editor.module.css';
import Note from '../../scripts/notes/note.js';
import Notebook from '../../scripts/notes/notebook';
import EditorConnection from './EditorConnection';
import AddConnection from './AddConnection';
import { binarySearch, binaryInsert } from '../../scripts/utility/utility';
import { useUserOrder, useSetUserOrder, useSelected, useSetSelected, useGraph, useSetGraph, useNotebooks, useSetNotebooks, useUserId } from '../LoginProvider';
import { addMultipleConnsOnBack, createNotebookOnBack, createNoteOnBack, deleteMultipleConnsOnBack, updateNoteOnBack } from '../../axios/axios';
import { Link } from 'react-router-dom';
import { useSharedState } from '../../hooks/useGlobalState.js';

const automaticallySave = false;

const notebookIcon = require("../../resources/notebook.png");

const noteTypeDescriptions = {
	main: "Appears as a its own centering note in the Thought Wall.",
	sticky: 'Appears only when a connection for "Main" note types and not as its own centering note.',
}

const connectionsWithWeightZero = (connections) => {
	return connections?.filter(conn => conn.weight === 0);
}

const Editor = ({ onMount, newNoteId }) => {

	const graph = useGraph(), setGraph = useSetGraph();
	const userOrder = useUserOrder(), setUserOrder = useSetUserOrder();
	const { note, index } = useSelected(), setSelected = useSetSelected();
	const notebooks = useNotebooks(), setNotebooks = useSetNotebooks();
	const userId = useUserId();

	const [noteInEditor, setNoteInEditor] = useState(new Note());
	const [noteInEditorIndex, setNoteInEditorIndex] = useState(-1);

	const [notebookName, setNotebookName] = useState('');
	const [connections, setConnections] = useState([]);

	const [initialGraphValues, setInitialGraphValues] = useState(
		{ loadedSize: false, highestId: 0, notesAdded: 0 }
	);

	const dataListRef = useRef(null);
	const notebookRef = useRef(null)
	const titleRef = useRef(null);
	const textRef = useRef(null);

	const [isNoteboxPinned] = useSharedState('notebox/isPinned');

	useEffect(() => { // Focuses on title input when first mounting
		onMount?.();
	}, []);

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
		setNoteInEditor(new Note(
			note?.id ? note.id : null,
			note?.title ? note.title : '',
			note?.text ? note.text : '',
			note?.quotes ? note.quotes : '',
			note?.idNotebook ? note.idNotebook : -1,
			note?.main ? note.main : false,
			note?.dateCreated ? note.dateCreated : 'No Date',
			note?.allNotesPosition ? note.allNotesPosition : null,
		));
		setNoteInEditorIndex(index);
		setNotebookName(getNotebookName(note?.idNotebook) ?? '');
		setConnections(graph.getVertexNeighborsWithWeightZero(index)); // Format - [ { v: { id: _ } weight: _ }, etc. ]
	}, [note, index, dataListRef]);

	useEffect(() => { // Marks note as unsaved if connections have changed
		if (initialGraphValues.loadedSize !== false) onInputChange();
	}, [connections]);

	useEffect(() => {
		if (!isNoteboxPinned) {
			notebookRef.current.focus();
		}
	}, [newNoteId, isNoteboxPinned]);

	useUnmount(() => { // Removes any unsaved notes when unmounting: O(m + n)

		const { loadedSize } = initialGraphValues;
		if (loadedSize === false) return;

		// Removes unsaved notes from graph, and determines new graphIndices for userOrder: 
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
		
		// Removes from userOrder, and updates graph indices: O(n)
		setUserOrder(userOrder.filter((obj, i, arr) => {
			if (newGraphIndices.has(obj.id)) obj.graphIndex = newGraphIndices.get(obj.id);
			return obj.id > 0;
		}));
		
		if (note?.id < 0) {
			const firstNote = newGraph.getVertex(0);
			setSelected({ note: firstNote ?? null, index: firstNote ? 0 : null });
		}

		setGraph(newGraph);
	}, []);

	useUnmount(() => { // Prompts user to save note if it has been edited
		if (note?.id && noteInEditor?.id && graph.indexOf(noteInEditor) !== -1) updateOnBackFront();
	}, [note]);

	const updateOnBackFront = (e) => {

		// Determines notebook id if existent
		let { id: notebookId } = notebooks.find((nb) => nb.name === notebookName) || { id: null };

		const updated = { idNotebook: notebookId };
		const hasChanged = isEditorChanged(updated);

		if (hasChanged && !e) { // Changes made and diff note selected or connections have changed

			if (!automaticallySave && !window.confirm(`Would you like to save note '${noteInEditor.title}'?`)) {
				const note = graph.getVertex(String(noteInEditor.id));
				note.title = (note.title[0] === '﻿') ? note.title.slice(1) : note.title; // '﻿' indicated unsaved

				graph.updateVertex(note);
				setGraph(graph.clone());
				return false;
			}

		} else if (!hasChanged && !e) { // No changes made and different note selected
			return false;
		}

		if (notebookName === '') {
			window.alert("A notebook must be selected.");
			return false;
		}

		let alertMessage = '';

		createNotebookIfNotExists({ id: notebookId, name: notebookName })
			.then((notebook) => {
				if (notebook.id !== notebookId) {
					alertMessage = `Notebook '${notebookName}' created.`;
					notebookId = notebook.id;
				}
				addUpdateNote();
			})
			.catch(() => {
				return false;
			});

		function addUpdateNote () {

			const title = String(noteInEditor.title);
			let updatingNote = { 
				...noteInEditor, 
				title: (title[0] === '﻿') ? title.slice(1) : title,
				idNotebook: Number(notebookId),
			};

			if (note?.id < 0) { // Adding a note

				updatingNote.idUser = userId; // Add to backend first to get new note 'id'
				createNoteOnBack(updatingNote).then((response) => {

					let idUser, graphIndex;
					({ idUser, ...updatingNote } = { ...updatingNote, id: response.data.id });

					// Add note to front
					graph.updateVertex(updatingNote, graphIndex = graph.indexOf(noteInEditor)); 
					setInitialGraphValues({ ...initialGraphValues, notesAdded: ++initialGraphValues.notesAdded });

					const updatingIndex = userOrder.findIndex(obj => obj.id === noteInEditor.id);
					userOrder[updatingIndex] = {
							id: updatingNote.id,
							graphIndex,
							order: updatingNote.allNotesPosition,
						}
					setUserOrder(userOrder.concat());
					
					// Add note connections to back and front
					const connectionIds = connections.map((conn) => conn.v.id);
					addMultipleConnsOnBack(userId, updatingNote.id, connectionIds);
					for (let conn of connections) { 
						graph.addEdge(updatingNote, conn.v);
					}
					setGraph(graph.clone());

					// Only updates editor states if button clicked (not if other note selected)
					if (e) {
						setNoteInEditor(updatingNote);
						setSelected({ note: updatingNote, index: index });
					}

					alertMessage += ((alertMessage) ? '\n' : '') + `Note '${updatingNote.title}' created.`;
				});

			// Updating a note
			} else {
				// On frontend (note)
				if (e) {
					setNoteInEditor(updatingNote); // Only updates if button clicked (not other note selected)
					setSelected({ note: updatingNote, index: index });
				}
				graph.updateVertex(updatingNote);

				// On backend (note)
				updatingNote.idUser = userId;
				updateNoteOnBack(updatingNote);
				delete updatingNote.idUser;

				// Gets the connections that were added and removed
				const prevConns = graph.getVertexNeighbors(updatingNote);
				const [newConns, removeConns] = getAddedAndRemovedConnections(prevConns);

				// On frontend (note's connections)
				updateConnectionsOnFront(updatingNote.id, newConns, removeConns);

				// On backend (note's connections)
				if (newConns.length !== 0) {
					addMultipleConnsOnBack(userId, updatingNote.id, newConns);
				}
				if (removeConns.length !== 0) {
					deleteMultipleConnsOnBack(userId, updatingNote.id, removeConns);
				}

				alertMessage += ((alertMessage) ? '\n' : '') + `Note '${updatingNote.title}' updated.`;
			}
		}
	};

	/**
	 * An asynchronous function that creates a new notebook on front and backend if the passed in 
	 * notebook does not exist.
	 * 
	 * @param {Notebook} notebook The notebook to create if not in the notebooks array.
	 */
	const createNotebookIfNotExists = async (notebook) => {
		return new Promise((resolve, reject) => {

			const [ exists ] = (notebook.id) ? binarySearch(notebooks, notebook.id, 1) : [];

			if (!exists) {
				if (!window.confirm("Create notebook '" + notebookName + "'?")) {
					reject();
				} else { // Creates the new Notebook

					Object.assign(notebook, { // Notebook object to send
						idUser: userId, 
						dateCreated: new Date(),
					});
						
					createNotebookOnBack(notebook).then((response) => {
						notebook.id = response.data.id;
						notebooks.push(new Notebook(response.data.id, notebookName));
						setNotebooks(notebooks);

						resolve(notebook);
					});
				}
			} else {
				resolve(notebook);
			}
		})
	}

	const updateConnectionsOnFront = (noteId, newConns, removeConns) => {
		for (let newConn of newConns) { // Adds new connections
			graph.addEdge({ id: noteId }, { id: newConn });
		}
		for (let removeConn of removeConns) { // Deletes connections
			graph.removeEdge({ id: noteId }, { id: removeConn });
		}
		setGraph(graph.clone());
	}
	
	// Determines connections to add and remove to backend: O(n)
	const getAddedAndRemovedConnections = (prevConns) => {
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
	}

	/**
	 * Binary searches for the name of a notebook from its id: O(log n)
	 * 
	 * @param {*} id The value of the 'id' property of the notebook to find.
	 * @returns null if notebook not found.
	 */
	const getNotebookName = (id) => {
		if (typeof id !== 'number' || id === 0) return null;
		const nbName = binarySearch(notebooks, id, 1)[0].name;
		return nbName ? nbName : null;
	}

	const onAddConnection = (noteId, noteTitle) => {
		binaryInsert(connections, { id: Number(noteId) });
        setConnections(connections.concat());
	};

	const onClickConnection = (e, note) => {
		const index = graph.getVertices().findIndex((n) => n.id === note.id);
		console.log(note, index);
		setSelected({ note: note, index });
	}

	const onRemoveConnection = (e, note) => {
		const index = binarySearch(connections, note.id, 0, 'v.id')[1];
		connections.splice(index, 1);
		setConnections(connections.concat());
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

		if (hasChanged) {
			const note = graph.getVertex(noteInEditorIndex);
			if (note && note.title[0] !== '﻿') {
				note.title = '﻿' + note.title;
				graph.updateVertex(note);
				setGraph(graph.clone());
				if (e) setTimeout(() => e.target.focus(), 5);
			}
		}
	}

	const isEditorChanged = (updated = {}) => {
		return noteChanged(updated) || connectionChanged();
	}

	const noteChanged = (updated = {}) => {
		const originalNote = graph.getVertex(noteInEditorIndex);
		const newNote = Object.assign({ ...noteInEditor }, updated);
		return JSON.stringify(originalNote) !== JSON.stringify(newNote);
	}

	const connectionChanged = () => {
		const prevConns = graph.getVertexNeighborsWithWeightZero(noteInEditorIndex);
		return !(getAddedAndRemovedConnections(prevConns).every(conns => conns.length === 0));
	}

	const noteListWithoutConnections = () => { // O(log n * c)

		let noteList = graph.getVertices();
		noteList.splice((note?.id < 0) 
			? initialGraphValues.loadedSize - 1 + Math.abs(note?.id) // Unsaved note: O(1)
			: binarySearch(noteList, note?.id)[1], 1); // Removes current note id: O (log n)

		if (connections) for (let conn of connections) { // Removes connection ids
            const index = binarySearch(noteList, conn.v.id)[1];
            noteList.splice(index, 1);
        }

        return noteList;
    }

	function mainToggle (e) {
		setNoteInEditor({ ...noteInEditor, main: (e.target.id === 'mainRadio') ? true : false });
	};

    return (
        <form className={styles.form}>
			<div className={styles.flexRow}>
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
					disabled={note === null}
				/>
				<datalist id="notebookOptions" ref={dataListRef}>
					{notebooks?.map((nb, index) => (
						nb.name !== 'All Notebooks' ? (
							<option value={nb.name} key={index}>{nb.name}</option>
						) : null
					))}
				</datalist>
				{/* <Link to='/' className={`link ${styles.thoughtWallLink}`}>See In Wall</Link> */}
			</div>

			<div className={styles.editorAndConnections}>
				<div 
					id={styles.editor} 
					className={(noteInEditor.main === undefined || noteInEditor.main || note === null) 
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
						disabled={note === null}
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
						disabled={note === null}
					/>
					<textarea 
						id={styles.quotes} 
						className={`${styles.editorTextInputs} ${noteInEditor.main ? '' : 'flex0'}`} 
						placeholder="Quotes" 
						value={noteInEditor.quotes ?? ''}
						onChange={onInputChange}
						disabled={note === null}
					/>
					<div className={styles.radioRow}>
						<input 
							type="radio" 
							className={"btn-check " + styles.radios}
							name="options-outlined" 
							id="mainRadio"
							autoComplete="off" 
							checked={noteInEditor.main || note === null} 
							onChange={mainToggle} 
							disabled={note === null}
						/>
						<label 
							className="btn" 
							id={styles.mainButton} 
							htmlFor="mainRadio" 
						>
							Main Note
							<div className={styles.typeDescription}>{noteTypeDescriptions.main}</div>
						</label>

						<input 
							type="radio"
							className={"btn-check " + styles.radios}
							name="options-outlined"
							id="stickyRadio"
							autoComplete="off" 
							checked={!noteInEditor.main && note !== null} 
							onChange={mainToggle} 
							disabled={note === null}
						/>
						<label 
							className="btn" 
							id={styles.stickyButton} 
							htmlFor="stickyRadio"
						>
							Sticky Note
							<div className={styles.typeDescription}>{noteTypeDescriptions.sticky}</div>
						</label>
					</div>
				</div>

				<div id={styles.connectionsRow}>
					{connections?.map((connectingNote, i) => (
						!!connectingNote && <EditorConnection 
							note={getConnectingNote(connectingNote?.v.id)} 
							onClick={onClickConnection}
							onRemove={onRemoveConnection}
							className={styles.connectionContainer}
							lineClassName={styles.connectionLine}
							key={i}
						/>
					))}
					<AddConnection 
						currentNoteId={note?.id}
						noteList={noteListWithoutConnections()}
						onAddConnection={onAddConnection}
						disabled={note === null}
						className={`${styles.connectionContainer} ${styles.add}`}
						lineClassName={styles.connectionLine}
					/>
					<div id={styles.connectedToLabel}>Connections</div>
				</div>
			</div>

			<input 
				type="button" 
				id={styles.addUpdate}
				className={`${note === null ? styles.addUpdateDisabled : styles.addUpdateEnabled} button`}
				value={note === null ? 'No note' : note?.id < 0 ? "Create" : "Update"} 
				onClick={updateOnBackFront}
				disabled={note === null ? true : false}
			/>
        </form>
    )
};

export default Editor;