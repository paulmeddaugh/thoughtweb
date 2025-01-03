import styles from '../../styles/ThoughtWall/ThoughtWall.module.css';
import { Fragment, useCallback, useLayoutEffect, useMemo, useReducer, useRef, useState } from "react";
import NoteWall from "./NoteWall";
import BigNote from "./BigNote";
import Connection from "./Connection";

import { useNavigate } from "react-router-dom";
import { useNotebox } from "../../context/notebox";
import { useNoteGraph } from "../../context/noteGraph";
import { useSelected } from "../../context/selected";
import { useNoteOrder } from "../../context/noteOrder";
import { useNotePoints } from "../../context/notePoints";

import { THOUGHTWALL_NOTE_DRAG_MODES, WINDOW_WIDTH_TO_FILL } from "../../constants/constants";
import { 
    MAIN_NOTE_SIZE, 
    STICKY_NOTE_SIZE, 
    STICKY_NOTE_WALL_WIDTH, 
    NOTE_WALL_Y_START, 
} from "../../constants/constants";
import { RED } from "../../constants/colors";

import Point from '../../scripts/notes/point';
import Box from "../../scripts/notes/box";

import { binarySearch } from '../../scripts/utility/utility';

const draggingReducer = (state, action) => {
    switch (action?.type) {
        case 'toggleDragMode':
            return {
                ...state,
                dragMode: state?.dragMode === THOUGHTWALL_NOTE_DRAG_MODES.CONNECTION
                    ? THOUGHTWALL_NOTE_DRAG_MODES.NOTE
                    : THOUGHTWALL_NOTE_DRAG_MODES.CONNECTION,
            };
        case `dragStart`:
            return {
                ...action?.payload,
                dragMode: state?.dragMode
            };
        case `drag`: // not used in dragMode === THOUGHTWALL_NOTE_DRAG_MODES.NOTE
            return {
                ...state,
                ...action?.payload,
                dragMode: state?.dragMode
            };
        case `dragEnd`:
        default:
            return {
                dragMode: state?.dragMode,
            };
    }
}

const ThoughtWall = () => {

    const { graph, addFrontendNote, addConnectionsToNote } = useNoteGraph();
    const { selected, setSelectedNote } = useSelected();
    const { orderedNotes } = useNoteOrder();
    const { isPinned: isNoteboxPinned, transitionToEditorFromPoint } = useNotebox();

    const thoughtWallRef = useRef(null);
    const noteRefs = useRef(new Map()).current;

    const { orderedNotePointsById } = useNotePoints();

    const { updateNote } = useNoteGraph();
    const [dragging, draggingDispatch] = useReducer(draggingReducer, { 
        dragMode: THOUGHTWALL_NOTE_DRAG_MODES.CONNECTION
    });

    const navigate = useNavigate();

    useLayoutEffect(() => {
        // Scrolls to note upon selection
        if (selected?.scrollTo === false) return;

        const notePoint = orderedNotePointsById[selected.note?.id];
        if (!notePoint) return;

        let { width: thoughtWallWidth, height: thoughtWallHeight } = thoughtWallRef.current.getBoundingClientRect();

        const isNoteBoxFilled = isNoteboxPinned && (window.innerWidth < WINDOW_WIDTH_TO_FILL);
        if (isNoteBoxFilled) thoughtWallWidth = window.innerWidth;

        const noteDims = {
            width: selected.note?.main ? 0 : STICKY_NOTE_SIZE.width,
            height: selected.note?.main ? 0 : STICKY_NOTE_SIZE.height
        };

        setTimeout(() => {
            thoughtWallRef.current?.scrollTo({
                left: notePoint.x - (thoughtWallWidth / 2) + noteDims.width / 2, 
                top: notePoint.y - (thoughtWallHeight / 2) + noteDims.height / 2,
                behavior: 'smooth' 
            });
        }, 0);
    }, [selected, thoughtWallRef, isNoteboxPinned, orderedNotePointsById]);

    const getConnectingNotes = useCallback((note) => {
        return graph.getVertexNeighbors(String(note.id));
    }, [graph])

    const handleNoteClick = useCallback((note, orderedIndex, point) => {
        const graphIndex = graph.indexOf(orderedNotes[orderedIndex]);
        setTimeout(() => {
            setSelectedNote(note, graphIndex);
        }, 50);
    }, [graph, orderedNotes, setSelectedNote])

    const onConnectionClick = (note, orderedIndex, point, bigNoteIdStack, onCloseHandler) => {
        const graphIndex = graph.indexOf(orderedNotes[orderedIndex]);

        // Scrolls to note on wall rather than create new one if 'Main' type
        if (note.main && bigNoteIdStack.length !== 0) {
            setSelectedNote(note, graphIndex);
            return;
        }
        
        // Smooth scrolls to the connected note
        const { width, left } = thoughtWallRef.current.getBoundingClientRect();
        const noteWidth = (note.main) ? MAIN_NOTE_SIZE.width : STICKY_NOTE_WALL_WIDTH;
        const absolutePointX = point.x - left + thoughtWallRef.current.scrollLeft + noteWidth;
        const scrollX = absolutePointX - (width / 2);
        thoughtWallRef.current.scrollTo({ left: scrollX, behavior: 'smooth' });

        // Generates a NoteWall with the connected note as the center
        return (
            <NoteWall 
                noteAndIndex={{ note: graph.getVertex(graphIndex), index: graphIndex }}
                centerPoint={new Point(absolutePointX, NOTE_WALL_Y_START)}
                connectingNotes={getConnectingNotes(orderedIndex, true)}
                onNoteClick={handleNoteClick}
                onConnectionClick={onConnectionClick}
                originBigNoteIdStack={bigNoteIdStack}
                selected={selected}
                extendBoundaryBy={75}
                isCloseable={onCloseHandler ? true : false}
                onClose={onCloseHandler ? onCloseHandler : null}
            />
        );
    };

    const handleThoughtwallClicked = useCallback(e => {
        if (e.target.className !== styles.main) return;

        const { left, top } = e.target.getBoundingClientRect();
        const notePoint = new Point(
            e.clientX - parseInt(left),
            e.clientY - parseInt(top),
        );

        const onTransitionFullscreen = () => {
            const newNote = addFrontendNote(notePoint);
            setSelectedNote(newNote, graph.size());
            navigate('/editor');
        }

        transitionToEditorFromPoint(notePoint, onTransitionFullscreen);
    }, [addFrontendNote, transitionToEditorFromPoint, navigate, setSelectedNote, graph])

    const handleThoughtwallDragOver = useCallback(e => {
        e.dataTransfer.dropEffect = "move";
        e.preventDefault();
    }, []);

    const handleNoteDragStart = useCallback((e, note, index) => {
        let payload = null;
        if (dragging?.dragMode === THOUGHTWALL_NOTE_DRAG_MODES.NOTE) {
            const { left, top, width, height } = e.target.getBoundingClientRect();
            payload = {
                startCenterOffsetX: e.clientX - left - (width / 2),
                startCenterOffsetY: e.clientY - top - (height / 2),
            };
        } else {
            const { left: parentLeft, top: parentTop } = e.target.parentElement.getBoundingClientRect();
            const { scrollLeft, scrollTop } = thoughtWallRef.current;
            const noteRefBoxes = Array.from(noteRefs.entries())
                .map(([id, el]) => Box.fromElement(el, id, parentLeft - scrollLeft, parentTop - scrollTop))
                .sort((box1, box2) => box1.p1.x - box2.p1.x);
            payload = {
                noteRefBoxes,
                notePoint: note?.point,
                parentLeft,
                parentTop,
            };
        }

        draggingDispatch({ type: 'dragStart', payload })
    }, [dragging?.dragMode, noteRefs]);

    const handleNoteDrag = useCallback((e, note, index) => {
        if (dragging?.dragMode === THOUGHTWALL_NOTE_DRAG_MODES.NOTE) return;
        const { scrollLeft, scrollTop } = thoughtWallRef.current;
        console.log('scrolling', scrollLeft, scrollTop)
        const mousePoint = new Point(
            e.clientX - dragging?.parentLeft + scrollLeft, 
            e.clientY - dragging?.parentTop + scrollTop
        );
        let noteHoveringId = null;
        for (let box of dragging.noteRefBoxes) {
            if (box.isPointWithin(mousePoint)) {
                noteHoveringId = box.id;
                break;
            }
        }
        draggingDispatch({ 
            type: 'drag', 
            payload: {
                mousePoint,
                noteHoveringId,
            }
        })
    }, [dragging]);

    const handleNoteDragEnd = useCallback(async (e, note, index) => {
        switch (dragging?.dragMode) {
            case THOUGHTWALL_NOTE_DRAG_MODES.NOTE:
                e.preventDefault();
                const thoughtwall = e.target.parentElement;
                const { left, top } = thoughtwall.getBoundingClientRect();
                const { startCenterOffsetX, startCenterOffsetY } = dragging;
                note.point = new Point(
                    e.clientX - startCenterOffsetX - parseInt(left) + thoughtwall.scrollLeft,
                    e.clientY - startCenterOffsetY - parseInt(top) + thoughtwall.scrollTop,
                );
                await updateNote(note);
                break;
            default: 
            case THOUGHTWALL_NOTE_DRAG_MODES.CONNECTION:
                const { noteRefBoxes, mousePoint } = dragging;
                for (let box of noteRefBoxes) {
                    if (box.isPointWithin(mousePoint)) {
                        console.log('connection made', box.id)
                        await addConnectionsToNote(note, [{ v: { id: box.id } }]);
                        break;
                    }
                }
        }

        setSelectedNote(note, index);
        draggingDispatch({ type: 'dragEnd' });
    }, [addConnectionsToNote, dragging, setSelectedNote, updateNote]);

    const handleDragModeClick = useCallback((e, note, index) => {
        console.log('toggled');
        draggingDispatch({ type: 'toggleDragMode' });
    }, []);

    return (
        <div 
            className={styles.main} 
            ref={thoughtWallRef} 
            onClick={handleThoughtwallClicked}
            onDragOver={handleThoughtwallDragOver}
        >
            {orderedNotes.map((note, index) => (
                <Fragment key={note.id}>
                    <BigNote 
                        note={note}
                        index={index}
                        onClick={handleNoteClick}
                        dragMode={dragging?.dragMode}
                        onDragStart={handleNoteDragStart}
                        onDrag={handleNoteDrag}
                        onDragEnd={handleNoteDragEnd}
                        onDragModeIconClick={handleDragModeClick}
                        // inlineStyle={Point.toInlineStyle(orderedNotePointsById[note?.id])}
                        isSelected={selected?.note?.id === note.id}
                        isHovering={dragging?.noteHoveringId === note.id}
                        ref={ref => noteRefs.set(note?.id, ref)}
                    />
                    {getConnectingNotes(note)?.map(({ v }) => (
                        <Connection 
                            pointFrom={orderedNotePointsById[note?.id]}
                            pointTo={orderedNotePointsById[v?.id]}
                            stroke={RED}
                            strokeWidth={5}
                            key={`conn~${note?.id}-${v?.id}`}
                        />
                    ))}
                </Fragment>
            ))}
            {(dragging?.notePoint && dragging?.mousePoint) && (
                <Connection 
                    pointFrom={dragging?.notePoint}
                    pointTo={dragging?.mousePoint}
                    stroke={RED}
                    strokeWidth={5}
                />
            )}
            {/* <svg>
                {orderedNotes.map((note, index) => (
                    getConnectingNotes(note)?.map(({ v }) => (
                        <Connection 
                            pointFrom={orderedNotePointsById[note?.id]}
                            pointTo={orderedNotePointsById[v?.id]}
                            stroke={RED}
                            strokeWidth={3}
                            key={`conn~${note?.id}-${v?.id}`}
                        />
                    ))
                ))}
            </svg> */}
        </div>
    )
}

export default ThoughtWall;