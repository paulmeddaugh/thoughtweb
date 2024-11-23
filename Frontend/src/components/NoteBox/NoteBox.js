import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import styles from '../../styles/NoteBox/NoteBox.module.css';
import NoteBoxNote from './NoteBoxNote';
import CustomSelect from './CustomSelect';
import Notebook from '../../scripts/notes/notebook'
import ReorderingLine from './ReorderingLine';
import { ListGroup } from 'react-bootstrap';
import { DEFAULT_WIDTH, WINDOW_WIDTH_TO_FILL, NOTEBOOK_CONSTANTS } from '../../constants/constants';
import SearchBar from './SearchBar';
import { useLocation } from 'react-router-dom';
import { useNotebox } from '../../context/notebox';
import { useNotebooks } from '../../context/notebooks';
import { useNoteOrder } from '../../context/noteOrder';
import { useNoteGraph } from '../../context/noteGraph';
import { useSelected } from '../../context/selected';

let noteboxWidth = window.innerWidth > WINDOW_WIDTH_TO_FILL ? DEFAULT_WIDTH : window.innerWidth + 1;

let resizing = false;

const pinSrc = require("../../resources/pinIconUnfilled.png");
const unpinSrc = require("../../resources/pinIconFilled.png");
// const filterIcon = require("../../resources/filterIcon.png");

const NoteBox = () => {

    const { graph, updateNote, deleteNote } = useNoteGraph();
    const { orderedNotes, updateNoteOrderAt, removeNoteOrder, removeNoteOrdersOfNotebook } = useNoteOrder();
    const { notebooks, createNotebook, updateNotebook, deleteNotebook } = useNotebooks();
    const { selected, setSelectedNote, setSelectedNotebook } = useSelected();
    const { isPinned, setPinned } = useNotebox();

    const [searchVal, setSearchVal] = useState('');
    const [areSearchResults, setSearchResults] = useState(true);

    // For reordering notes in a user-defined order
    const reorderingProps = useRef(null); // { note, index, noteArrRefs }
    const [reorderingNotePoints, setReorderingNotePoints] = useState(null); // { dragPoint, snapPoint }
    const snapIndex = useRef(0); // The index in the graph the user is reordering reorderingNoteProps.note to

    const infobox = useRef(null);
    const listGroupFlush = useRef(null);
    const noteBoxNoteRefs = useRef(new Map());

    const pinIcon = useRef(null);

    const location = useLocation();

    const notebookOptions = useMemo(() => {
        const options = notebooks.concat();
        options.unshift(new Notebook(NOTEBOOK_CONSTANTS.ALL_NOTEBOOKS, "All Notebooks"));
        options.push(new Notebook(NOTEBOOK_CONSTANTS.ADD_A_NEW_NOTEBOOK, "New"));
        return options;
    }, [notebooks]);

    const [notebookSelectValue, setNotebookSelectValue] = useState({
        innerHTML: notebookOptions[0].name,
        id: notebookOptions[0].id,
    });

    const orderedNotesWithNewNotesFirst = useMemo(() => {
        const notes = orderedNotes.reduce((orderedNotes, note, i) => {
            if (note.id < 0) { // places newly created notes at beginning of array, 
                orderedNotes.splice(i, 1); // maintaining O(n)
                orderedNotes.unshift(note);
            }
            return orderedNotes;
        }, orderedNotes);
        return notes;
    }, [orderedNotes]);

    useEffect(() => {
        infobox.current.style.width = noteboxWidth + 'px';
        const onResize = (e) => {
            if (!resizing) return;
            infobox.current.style.width = noteboxWidth - e.clientX;
        }
        infobox.current.addEventListener("mousedown", () => resizing = true);
        infobox.current.addEventListener("mousemove", onResize);
        infobox.current.addEventListener("mousemove", () => resizing = false);
    }, []); 

    useEffect(() => {
        setSearchResults(graph.size());
        setPinned(!(!graph.size() && window.innerWidth < WINDOW_WIDTH_TO_FILL));
    }, [graph, setPinned]);

    useEffect(() => {
        if (isPinned) {
            const isThoughtWall = location.pathname === '/';
            const isSmallScreen = window.innerWidth < WINDOW_WIDTH_TO_FILL;

            infobox.current.style.position = (isSmallScreen) ? 'absolute' : 'relative';
            infobox.current.style.opacity = (isThoughtWall && isSmallScreen) ? .82 : 1;
        }
    }, [location.pathname, isPinned]);

    useEffect(() => {

        if (!infobox.current) return;

        infobox.current.style.transition = '1s ease';

        if (isPinned) {
            const isThoughtWall = location.pathname === '/';
            const isSmallScreen = window.innerWidth < WINDOW_WIDTH_TO_FILL;

            infobox.current.style.width = noteboxWidth + 'px';
            infobox.current.style.position = (isSmallScreen) ? 'absolute' : 'relative';
            infobox.current.style.opacity = (isThoughtWall && isSmallScreen) ? .82 : 1;
            infobox.current.style.right = null;
            pinIcon.current.style.display = 'none';

        } else { // unpinned
            infobox.current.style.width = '0px';
            pinIcon.current.style.display = 'flex';

            const finalUnpinnedStyle = () => {
                infobox.current.style.position = 'absolute';
                infobox.current.style.right = '100%';
            }

            setTimeout(() => finalUnpinnedStyle(), 1000); // Allows transition effect first
        }

        // Handles resizing
        let timeoutId;
        const startingTransition = '1s ease';

        const handleResize = (e) => {

            // screen width small enough to fill with Notebox
            if (window.innerWidth < WINDOW_WIDTH_TO_FILL) {

                if (!isPinned) {
                    noteboxWidth = window.innerWidth;
                    return;
                }
                
                infobox.current.style.width = (noteboxWidth = window.innerWidth) + 'px';

                // waits until NoteBox width fully transitions before removing transition style
                const id = timeoutId = setTimeout(() => {
                    if (id === timeoutId) {
                        infobox.current.style.transition = 'unset';
                    }
                }, parseInt(startingTransition) * 1000);

            } else {
                infobox.current.style.transition = startingTransition;
                infobox.current.style.width = (noteboxWidth = DEFAULT_WIDTH) + 'px';
                timeoutId = null;
            }
        };
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        }
    }, [isPinned]);

    const searchInputChange = (e) => {

        const newSearchVal = e.target.value;
        setSearchVal(newSearchVal);

        let anyNotes = false;
        const notesInBox = listGroupFlush.current.children;
        for (let i = 1; i < notesInBox.length; i++) {

            const idSelectedNb = notebookSelectValue.id;
            const idNotebook = notesInBox[i].getAttribute('data-idnotebook');
            const regex = new RegExp(newSearchVal, 'i');
            const isMatching = notesInBox[i].children[0].children[0].innerHTML.match(regex) || // in title
            notesInBox[i].children[1].innerHTML.match(regex); // or text

            if (isMatching && (!idSelectedNb || idSelectedNb === idNotebook)) {
                notesInBox[i].style.display = "block";
                anyNotes = true;
            } else {
                notesInBox[i].style.display = "none";
            }
        }

        setSearchResults(anyNotes);
    };

    const onSelectNote = (e, note, index) => {
        setSelectedNote(note, index);
    };

    /**
     * Moves reorderingNote component to visually represent reordering the note in whatever order
     * the user wishes. It tracks the index to reorder the note in noteOrder with snapIndex.current, with 
     * -1 being the very first, 0 between the first and second, etc. 
     * 
     * @param {*} e The 'dragstart' and 'drag' events.
     * @param {*} note The note object of the NoteBoxNote being dragged.
     * @param {number} index The index of the note object of the NoteBoxNote in the graph.
     */
    const onNoteDragStart = (e, note, index) => {
        if (note.id < 0) {
            alert("Please create the note before reordering it.");
            return;
        }

        const { halfWidth, halfHeight } = (function () {
            let { width, height } = e.target.getBoundingClientRect();
            return {
                halfWidth: width / 2, 
                halfHeight: height / 2,
            };
        })();

        const noteRefs = Array.from(noteBoxNoteRefs.current.values())
            .filter(ref => !!ref);

        // Determines snapPoints
        const snapPoints = noteRefs
            .map(ref => {
                const { left, top, height } = ref.getBoundingClientRect(); // current NoteBoxNote
                return { x: left, y: top + height, ref };
            })
            .sort((p1, p2) => p1.y - p2.y);

        if (snapPoints.length) {
            const { left, top } = snapPoints[0].ref.getBoundingClientRect();
            snapPoints.unshift({ x: left, y: top, ref: snapPoints[0].ref });
        }

        // Snapindex
        snapIndex.current = snapPoints.findIndex(p => 
            p.ref.href === e.target.href
        );
        const { top: infoboxTop } = infobox.current.getBoundingClientRect();

        reorderingProps.current = { 
            snapPoints,
            halfWidth,
            halfHeight,
            infoboxTop,
        };
        e.dataTransfer.setDragImage(e.target, halfWidth, halfHeight);

        onNoteDrag(e, note, index);
    };

    const onNoteDrag = (e, note, index) => {
        // Determines duplicated component dragPoint
        const { halfWidth, halfHeight, snapPoints, infoboxTop } = reorderingProps.current;
        const dragPoint = { 
            left: e.clientX - halfWidth, 
            top: e.clientY - halfHeight * 2 
        };

        if (!e.clientY) {
            setReorderingNotePoints(prev => ({ ...prev, dragPoint }));
            return;
        }

        const { y } = snapPoints[snapIndex.current];

        for (let index of [snapIndex.current - 1, snapIndex.current + 1]) {
            if (!snapPoints[index]) continue; // Skip out-of-bounds indexes

            const nextSnapY = snapPoints[index].y;
            const deltaCurrentY = Math.abs(e.clientY - y);       // Distance to current point
            const deltaNextSnapY = Math.abs(e.clientY - nextSnapY); // Distance to neighbor point

            // If closer to the neighboring point, update `snapIndex`
            if (deltaNextSnapY < deltaCurrentY) {
                snapIndex.current = index; // Move snapIndex to closer neighbor
                break;
            }
        }

        const { x: newX, y: newY } = snapPoints[snapIndex.current];
        setReorderingNotePoints({ dragPoint, snapPoint: { left: newX, top: newY - infoboxTop } });
    }

    const onNoteDrop = useCallback(async (e, note, index) => {
        setReorderingNotePoints(null);

        // Placed in the same order
        if (note.id === orderedNotes[snapIndex.current]?.id) return;

        await updateNoteOrderAt(note, snapIndex.current);
    }, [orderedNotes, updateNoteOrderAt]);

    const onDeleteNote = (e, note, index) => {

        if (!window.confirm("Are you sure you want to delete note \"" + note.title + "\"?")) {
            return;
        }

        removeNoteOrder(note.id);

        deleteNote(note.id);

        // Resets selected note if deleted
        if (note.id === selected.note.id) {
			const i = (selected.index - 1 >= 0) ? selected.index - 1 : -1;
            setSelectedNote(graph.getVertex(i), i);
		}

        e.stopPropagation();
    }

    const handleSelectNotebook = useCallback((innerHTML, value, id) => {
        // let anyNotes = false;
        // for (let i = 1, notesInBox = listGroupFlush.current.children; i < notesInBox.length; i++) {
        //     if ((notesInBox[i].getAttribute('data-idnotebook') === id) || (!id)) {
        //         notesInBox[i].style.display = 'block';
        //         anyNotes = true;
        //     } else {
        //         notesInBox[i].style.display = 'none';
        //     }
        // }

        // Adds or removes 'notebook' prop to filters on selection
        setSelectedNotebook(id);

        // setSearchResults(anyNotes ? true : false);
        setNotebookSelectValue({ innerHTML, id });
    }, [setSelectedNotebook]);

    const handleRenameNotebook = useCallback(async (name, newNotebook) => {
        try {
            await updateNotebook(newNotebook);
        } catch (e) {
            alert('Could not update notebook: ' + e?.response?.message);
        }
    }, [updateNotebook]);

    // Handler for the onRemove prop of the customized select for notebooks
    const handleDeleteNotebook = async (notebook) => {
        try {
            await deleteNotebook(notebook.id);
            removeNoteOrdersOfNotebook(notebook.id);
        } catch (e) {
            alert('Failed to delete notebook: ' + e?.response?.message);
            return;
        }
    };

    const handleCreateNotebook = async () => {
        const name = window.prompt("Please enter the name of the notebook you would like to add."); // returns null if canceled
        if (!name) return;
        try {
            await createNotebook(name);
            alert(`Notebook '${name}' created.`);
        } catch (e) {
            console.log(e);
            alert(`Could not create notebook: '${JSON.stringify(e?.response?.data?.errors || e?.response?.message)}'`);
        }
    }

    return (
        <div id={styles.noteBox}>
            <div id={styles.infobox} ref={infobox}>
                <SearchBar 
                    optionsList={graph.getVertices()}
                    onChange={searchInputChange}
                    value={searchVal} 
                >
                    <div id={styles.unpin} onClick={() => setPinned(false)}>
                        <img src={unpinSrc} alt="unpin" />
                    </div>
                </SearchBar>
                <CustomSelect
                    items={notebookOptions}
                    onSelect={handleSelectNotebook}
                    onDeleteNotebook={handleDeleteNotebook}
                    onRenameNotebook={handleRenameNotebook}
                    onAddNotebook={handleCreateNotebook}
                    defaultValues={notebookSelectValue}
                />
                {/* <div id={styles.noteContainer} > */}
                <ListGroup id={styles.noteContainer} variant="flush" ref={listGroupFlush}>
                    <div 
                        id={styles.noNotes} 
                        className={areSearchResults ? styles.searchResults : styles.noSearchResults}
                    >
                        I have no notes.
                    </div>
                    {orderedNotesWithNewNotesFirst?.map(note => (
                        <NoteBoxNote 
                            key={note.id}
                            note={note}
                            index={graph.indexOf(note)}
                            ref={(el) => noteBoxNoteRefs.current.set(note?.id, el)}
                            onSelect={onSelectNote}
                            onNoteDragStart={onNoteDragStart}
                            onNoteDrag={onNoteDrag}
                            onNoteDrop={onNoteDrop}
                            onDelete={onDeleteNote}
                        />
                    ))}
                </ListGroup>
            </div>
            {/* <div ref={resizeBarRef} className={styles.resizeBar} /> */}
            <div id={styles.pin} onClick={() => setPinned(true)} ref={pinIcon}>
                <span> thoughts </span>
                <img src={pinSrc} alt="pin" />
            </div>
            <div id={styles.reorderingNoteContainer}>
                {/* {!!reorderingNoteProps && <NoteBoxNote
                    ref={reorderingNoteRef}
                    note={reorderingNoteProps.note}
                    index={reorderingNoteProps.userOrderIndex}
                    selected={selected}
                    dragging={true}
                    style={reorderingNotePoints.dragPoint}
                />} */}
                {!!reorderingNotePoints && <ReorderingLine 
                    absoluteCoordinates={reorderingNotePoints.snapPoint}
                />}
            </div>
        </div>
    );
}

export default NoteBox;