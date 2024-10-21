import { useEffect, useRef, useState } from 'react';
import styles from '../../styles/NoteBox/NoteBox.module.css';
import NoteBoxNote from './NoteBoxNote';
import CustomSelect from './CustomSelect';
import Notebook from '../../scripts/notes/notebook'
import ReorderingLine from './ReorderingLine';
import { ListGroup } from 'react-bootstrap';
import { binarySearch } from '../../scripts/utility/utility';
import { comparePositions, positionAfter, positionBefore, positionBetween } from '../../scripts/utility/customOrderingAsStrings';
import { useGraph, useSetGraph, useUserOrder, useSetUserOrder, useSelected, useSetSelected, 
    useNotebooks, useSetNotebooks, useUserId, useSetFilters } from '../LoginProvider';
import { createNotebookOnBack, deleteNotebookOnBack, deleteNoteOnBack, updateOrderOnBack } from '../../axios/axios';
import { useSharedState } from '../../hooks/useGlobalState';
import { DEFAULT_WIDTH, WINDOW_WIDTH_TO_FILL, SNAP_OVERREACH } from '../../constants/constants';
import SearchBar from './SearchBar';
import { useLocation } from 'react-router-dom';

let noteboxWidth = window.innerWidth > WINDOW_WIDTH_TO_FILL ? DEFAULT_WIDTH : window.innerWidth + 1;

let resizing = false;

const pinSrc = require("../../resources/pinIconUnfilled.png");
const unpinSrc = require("../../resources/pinIconFilled.png");
const filterIcon = require("../../resources/filterIcon.png");

const NoteBox = () => {

    const graph = useGraph(), setGraph = useSetGraph();
    const userOrder = useUserOrder(), setUserOrder = useSetUserOrder();
    const notebooks = useNotebooks(), setNotebooks = useSetNotebooks();
    const selected = useSelected(), setSelected = useSetSelected();
    const userId = useUserId();
    const setFilters = useSetFilters();

    const [isPinned, setPinned] = useSharedState('notebox/isPinned');

    const [searchVal, setSearchVal] = useState('');
    const [areSearchResults, setSearchResults] = useState(true);
    const [customSelectValues, setCustomSelectValue] = useState({
        innerHTML: 'All Notebooks',
        'data-id': null,
    });

    // For reordering notes in a user-defined order
    const [reorderingNoteProps, setReorderingNoteProps] = useState(null); // { note, index, noteArrRefs }
    const [reorderingNotePoints, setReorderingNotePoints] = useState({}); // { dragPoint, snapPoint }
    const reorderingNoteRef = useRef(null);
    const snapIndex = useRef(0); // The index in the graph the user is reordering reorderingNoteProps.note to

    const infobox = useRef(null);
    const listGroupFlush = useRef(null);
    const noteBoxNoteRefs = useRef(new Set());

    const pinIcon = useRef(null);

    const location = useLocation();

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
    }, [graph]);

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

            const idSelectedNb = customSelectValues['data-id'];
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
        setSelected({ note, index });
    };

    /**
     * Moves reorderingNote component to visually represent reordering the note in whatever order
     * the user wishes. It tracks the index to reorder the note in userOrder with snapIndex.current, with 
     * -1 being the very first, 0 between the first and second, etc. 
     * 
     * @param {*} e The 'dragstart' and 'drag' events.
     * @param {*} note The note object of the NoteBoxNote being dragged.
     * @param {number} index The index of the note object of the NoteBoxNote in the graph.
     */
    const onSelectDrag = (e, note, index) => {

        const arr = (reorderingNoteProps !== null) ? // if noteArrRefs state hasn't been init yet
            reorderingNoteProps.noteArrRefs : getNoteBoxNoteRefs();

        if (e.type === "dragstart") {
            const { halfWidth, halfHeight } = getDraggingNoteBoxNoteHalfDimensions();
            snapIndex.current = arr.findIndex((val) => val === e.target);

            setReorderingNoteProps({ 
                note, 
                userOrderIndex: snapIndex.current, 
                graphIndex: index,
                noteArrRefs: Array.from(noteBoxNoteRefs.current),
                halfWidth,
                halfHeight
            });
        }

        // Determines duplicated component dragPoint
        const { halfWidth, halfHeight } = (reorderingNoteProps !== null) ? 
            reorderingNoteProps : getDraggingNoteBoxNoteHalfDimensions();
        const dragPoint = { left: e.clientX - halfWidth, top: e.clientY - halfHeight * 2 };
        
        /* Determines new snapPoint */
        const arrAppropSnapIndex = Math.max(snapIndex.current, 0);
        const { left, top, height } = arr[arrAppropSnapIndex].getBoundingClientRect(); // current NoteBoxNote

        // Checks if mouse is closer to another snapPoint
        let snapDistance, snapHeight = (snapIndex.current !== -1 ? height : 0);
        if (e.clientY && Math.abs(snapDistance = e.clientY - (top + snapHeight)) > halfHeight + SNAP_OVERREACH) {
            const noteBelow = snapDistance > 0;

            // Skips if new snapIndex will go out of bounds
            if (!(noteBelow && snapIndex.current === arr.length - 1) && !(!noteBelow && snapIndex.current === -1)) {
                if (noteBelow) { snapIndex.current++; } else { snapIndex.current--; }
                // console.log(arr, arrAppropSnapIndex)
                snapHeight = (snapIndex.current !== -1 ? halfHeight * 2 : 0);
                // console.log(snapIndex.current);
            }
        }

        const { top: infoboxTop } = infobox.current.getBoundingClientRect();
        const snapPoint = { left, top: top + snapHeight - infoboxTop };
        setReorderingNotePoints({ dragPoint, snapPoint });

        function getNoteBoxNoteRefs () {
            return Array.from(noteBoxNoteRefs.current);
        }

        function getDraggingNoteBoxNoteHalfDimensions () {
            let { width, height } = e.target.getBoundingClientRect();
            return {
                halfWidth: width / 2, halfHeight: height / 2,
            };
        }
    };

    const onSelectDrop = (e, note, index) => {
        //console.log('dropping', snapIndex.current, reorderingNoteProps.userOrderIndex);
        setReorderingNoteProps(null);

        // Placed in the same order
        if (snapIndex.current === reorderingNoteProps.userOrderIndex) return;

        // The new position
        note.allNotesPosition = (({
            [-1]: () => positionBefore(userOrder[0].order),
            [userOrder.length - 1]: () => positionAfter(userOrder[userOrder.length - 1].order),
        })[snapIndex.current]?.());
        if (!note?.allNotesPosition) {
            const o1 = userOrder[snapIndex.current].order, o2 = userOrder[snapIndex.current + 1].order;
            const smaller = true;
            note.allNotesPosition = positionBetween((smaller) ? o1 : o2, smaller ? o2 : o1);
        }
        
        // Deletes previous userOrder index of the note moving
        userOrder.splice(reorderingNoteProps.userOrderIndex, 1);

        /* snapIndex.current is 1 less than accurate userOrder index requiring a plus 1, but deleting
         * previous userOrder object first can additionally require 1 less if the deleted index
         * is below the inserting index of the new object
         */
        const deleteIndexEffect = reorderingNoteProps.userOrderIndex > snapIndex.current ? 1 : 0;
        
        // Inserts new note object in 'userOrder' array
        userOrder.splice(snapIndex.current + deleteIndexEffect, 0, {
            id: note.id,
            graphIndex: index,
            order: note.allNotesPosition,
        });
        // console.table(userOrder);

        // Updates on frontend 
        setUserOrder(userOrder.concat());
        graph.updateVertex(note);
        setGraph(graph.clone());

        // Updates allNotesPosition on backend
        updateOrderOnBack(note.id, note.allNotesPosition);
    };

    const onDeleteNote = (e, note, index) => {

        if (!window.confirm("Are you sure you want to delete note \"" + note.title + "\"?")) {
            return;
        }

        // Delete from backend
        if (note.id >= 0) deleteNoteOnBack(note.id);

        // Delete on frontend: O(1), O(n)
        graph.removeVertex(index);
        setGraph(graph.clone());

        // Updates all graphIndex properties of userOrder objects and removes deleted note
        for (let i = userOrder.length - 1; i >= 0; i--) {
            if (userOrder[i].id > note.id) {
                userOrder[i].graphIndex--;
            } else if (userOrder[i].id === note.id) {
                userOrder.splice(i, 1);
            }
        }
        setUserOrder(userOrder.concat());

        // Resets selected note if deleted
        if (note.id === selected.note.id) {
			const i = (selected.index - 1 >= 0) ? selected.index - 1 : -1;
			setSelected({ note: graph.getVertex(i), index: i });
		}

        noteBoxNoteRefs.current = new Set();

        e.stopPropagation();
    }

    const onSelectNotebook = (innerHTML, value, id) => {
        let anyNotes = false;
        for (let i = 1, notesInBox = listGroupFlush.current.children; i < notesInBox.length; i++) {
            if ((notesInBox[i].getAttribute('data-idnotebook') === id) || (!id)) {
                notesInBox[i].style.display = 'block';
                anyNotes = true;
            } else {
                notesInBox[i].style.display = 'none';
            }
        }

        // Adds or removes 'notebook' prop to filters on selection
        setFilters(prev => {
            if (id) {
                return { ...prev, notebook: id };
            } else {
                const {notebook, ...rest } = prev;
                return rest;
            }
        });

        setSearchResults(anyNotes ? true : false);
        setCustomSelectValue({ innerHTML, 'data-id': id });
    }

    // Handler for the onRemove prop of the customized select for notebooks
    const onDeleteNotebook = (notebook) => {

        // Deletes on backend
        deleteNotebookOnBack(notebook.id).then((response) => {
            if (response.status !== 200) {
                alert('Failed to delete notebook: ' + response.request.responseText);
            }
        });

        // Deletes notebook: O(log n) time
        const id = notebook.id, [, index] = binarySearch(notebooks, id, 1);
        notebooks.splice(index, 1);
        setNotebooks(notebooks);

        // Deletes notes in notebook from userOrder and graph: O(2n) time
        let deleteCount = 0;
        setUserOrder(userOrder.filter((orderObj) => {
            // Validates userOrderObj.graphIndex by checking id
            while (graph.getVertex(orderObj.graphIndex - deleteCount)?.id !== orderObj.id) {
                deleteCount++;
            }
            orderObj.graphIndex = orderObj.graphIndex - deleteCount;

            return graph.getVertex(orderObj.graphIndex).idNotebook !== id;
        }));

        for (let note of graph.getVertices()) {
            if (note.idNotebook === id) {
                graph.removeVertex(note);
            }
        }
        setGraph(graph.clone());

        noteBoxNoteRefs.current = new Set();
    };

    const onAddNotebook = () => {
        const name = window.prompt("Please enter the name of the notebook you would like to add.");
        const nb = { name, idUser: userId, dateCreated: new Date() };

        createNotebookOnBack(nb.id).then((response) => {
            notebooks.push(new Notebook(response.data.id, nb.name));
            setNotebooks(notebooks);

            alert(`Notebook '${nb.name}' created.`);
        });
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
                    items={notebooks}
                    onSelect={onSelectNotebook}
                    onDeleteClick={onDeleteNotebook}
                    onAddClick={onAddNotebook}
                    defaultValues={customSelectValues}
                />
                {/* <div id={styles.noteContainer} > */}
                <ListGroup id={styles.noteContainer} variant="flush" ref={listGroupFlush}>
                    <div 
                        id={styles.noNotes} 
                        className={areSearchResults ? styles.searchResults : styles.noSearchResults}
                    >
                        No notes found. 
                    </div>

                    {graph.getVertices()?.sort((n1, n2) => comparePositions(n2.allNotesPosition ?? '!', n1.allNotesPosition ?? '!'))
                        .reduce((prev, note, i, arr) => {
                        const comp = 
                            (<NoteBoxNote 
                                key={i}
                                note={note}
                                index={graph.indexOf(note)}
                                ref={(el) => {if (el) noteBoxNoteRefs.current.add(el)}}
                                onSelect={onSelectNote}
                                onSelectDrag={onSelectDrag}
                                onSelectDrop={onSelectDrop}
                                onDelete={onDeleteNote}
                            />);

                        if (note.id < 0) { // places newly created notes at beginning of array, 
                            arr.splice(i, 1); // maintaining O(n)
                            arr.unshift(comp);
                        } else {
                            arr[i] = comp;
                        }

                        return arr;
                    }, [])}
                </ListGroup>
            </div>
            {/* <div ref={resizeBarRef} className={styles.resizeBar} /> */}
            <div id={styles.pin} onClick={() => setPinned(true)} ref={pinIcon}>
                <span> thoughts </span>
                <img src={pinSrc} alt="pin" />
            </div>
            <div id={styles.reorderingNoteContainer}>
                {!!reorderingNoteProps && <NoteBoxNote
                    ref={reorderingNoteRef}
                    note={reorderingNoteProps.note}
                    index={reorderingNoteProps.userOrderIndex}
                    selected={selected}
                    dragging={true}
                    style={reorderingNotePoints.dragPoint}
                />}
                {!!reorderingNoteProps && <ReorderingLine 
                    absoluteCoordinates={reorderingNotePoints.snapPoint}
                />}
            </div>
        </div>
    );
}

export default NoteBox;