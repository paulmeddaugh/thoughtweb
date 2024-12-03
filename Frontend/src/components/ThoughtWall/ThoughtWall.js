import { Fragment, useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { binarySearch } from '../../scripts/utility/utility';
import styles from '../../styles/ThoughtWall/ThoughtWall.module.css';
import NoteWall from "./NoteWall";
import Point from '../../scripts/notes/point';
import Line from "./Line";
import { comparePositions } from "../../scripts/utility/customOrderingAsStrings";
import { WINDOW_WIDTH_TO_FILL } from "../../constants/constants";
import { RED } from "../../constants/colors";
import { 
    MAIN_NOTE_SIZE, 
    STICKY_NOTE_SIZE, 
    STICKY_NOTE_WALL_WIDTH, 
    NOTE_WALL_GAP, 
    NOTE_WALL_X_START, 
    NOTE_WALL_Y_START, 
    CENTER_LINE_X_OFFSET 
} from "../../constants/constants";
import { useNotebox } from "../../context/notebox";
import { useNoteGraph } from "../../context/noteGraph";
import { useSelected } from "../../context/selected";
import { useNoteOrder } from "../../context/noteOrder";
import BigNote from "./BigNote";
import Connection from "./Connection";
import { useNotePoints } from "../../context/notePoints";

const filterValidators = {
    notebook: (note, nbId) => nbId ? note.idNotebook === Number(nbId) : true,
};

const NOTE_WALL_GAP_BY_CONN_NUMBER = {
    0: NOTE_WALL_GAP * .5,
    1: NOTE_WALL_GAP * .7,
    2: NOTE_WALL_GAP * .8,
};

const getNoteWallGap = (connectionCount) => NOTE_WALL_GAP_BY_CONN_NUMBER[connectionCount] ?? NOTE_WALL_GAP;

const getNoteWallGapFromUserOrderIndex = (graph, orderedNotes, orderedIndex) => {
    const connCount = graph.getVertexNeighborsWithWeightZero(
        orderedNotes[orderedIndex]
    ).length;
    return getNoteWallGap(connCount);
}

const ThoughtWall = () => {

    const { graph, addFrontendNote } = useNoteGraph();
    const { selected, setSelectedNote } = useSelected();
    const { orderedNotes } = useNoteOrder();
    const { isPinned: isNoteboxPinned, transitionToEditorFromPoint } = useNotebox();

    const journalWallRef = useRef(null);

    const { orderedNotePointsById } = useNotePoints();

    useLayoutEffect(() => {
        // Scrolls to note upon selection
        if (selected?.scrollTo === false || !selected?.note?.main) return;

        console.log('fired');
        const notePoint = orderedNotePointsById[selected.note?.id];
        if (!notePoint) return;

        let { width: thoughtWallWidth, height: thoughtWallHeight } = journalWallRef.current.getBoundingClientRect();

        const isNoteBoxFilled = isNoteboxPinned && (window.innerWidth < WINDOW_WIDTH_TO_FILL);
        if (isNoteBoxFilled) thoughtWallWidth = window.innerWidth;

        const noteDims = {
            width: selected.note?.main ? 0 : STICKY_NOTE_SIZE.width,
            height: selected.note?.main ? 0 : STICKY_NOTE_SIZE.height
        };

        setTimeout(() => {
            journalWallRef.current?.scrollTo({
                left: notePoint.x - (thoughtWallWidth / 2) + noteDims.width / 2, 
                top: notePoint.y - (thoughtWallHeight / 2) + noteDims.height / 2,
                behavior: 'smooth' 
            });
        }, 0);
    }, [selected, journalWallRef, isNoteboxPinned, orderedNotePointsById]);

    const getConnectingNotes = (note, includeFromNotes = true) => {

        return graph.getVertexNeighbors(String(note.id));

        let graphIndex = 0;
        // Confirms valid graphIndex value of userOrderIndex
        if (typeof graphIndex !== 'number') return [];

        // Ids of all connections
        const connIds = (includeFromNotes)
            ? graph.getVertexNeighbors(graphIndex)
            : graph.getVertexNeighborsWithWeightZero(graphIndex)
        const notes = graph.getVertices();

        // Maps connection ids to live note data: O(n)
        const connectingNotes = connIds?.map(({ v, weight }, i) => {

            // Determines note: O(log n)
            const [ connNote ] = binarySearch(notes, v.id);

            // Determines userOrderIndex: O(log n)
            const { allNotesPosition } = connNote;
            // const [ , index ] = binarySearch(noteOrder, allNotesPosition, 0, 'order', comparePositions);
            const [ , index ] = binarySearch(orderedNotes, allNotesPosition, 0, 'allNotesPosition', comparePositions);

            return { note: connNote, index, weight };
        });

        return connectingNotes;
    }

    const onNoteMount = (note, orderedIndex, point) => {
        // Adds the scrollPoint of each note if not already set
        // if (!scrollToMap.has(note.id)) scrollToMap.set(note.id, point);
    } 

    const onCenterNoteClick = useCallback((note, orderedIndex, point) => {
        const graphIndex = graph.indexOf(orderedNotes[orderedIndex]);
        setTimeout(() => {
            setSelectedNote(note, graphIndex);
        }, 50);
    }, [setSelectedNote])

    const onConnectionClick = (note, orderedIndex, point, bigNoteIdStack, onCloseHandler) => {
        const graphIndex = graph.indexOf(orderedNotes[orderedIndex]);

        // Scrolls to note on wall rather than create new one if 'Main' type
        if (note.main && bigNoteIdStack.length !== 0) {
            setSelectedNote(note, graphIndex);
            return;
        }
        
        // Smooth scrolls to the connected note
        const { width, left } = journalWallRef.current.getBoundingClientRect();
        const noteWidth = (note.main) ? MAIN_NOTE_SIZE.width : STICKY_NOTE_WALL_WIDTH;
        const absolutePointX = point.x - left + journalWallRef.current.scrollLeft + noteWidth;
        const scrollX = absolutePointX - (width / 2);
        journalWallRef.current.scrollTo({ left: scrollX, behavior: 'smooth' });

        // Generates a NoteWall with the connected note as the center
        return (
            <NoteWall 
                noteAndIndex={{ note: graph.getVertex(graphIndex), index: graphIndex }}
                centerPoint={new Point(absolutePointX, NOTE_WALL_Y_START)}
                connectingNotes={getConnectingNotes(orderedIndex, true)}
                onNoteMount={onNoteMount}
                onNoteClick={onCenterNoteClick}
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

        // Adds new note to graph state
        const newNote = addFrontendNote(notePoint);
        
        transitionToEditorFromPoint(newNote, graph.size(), notePoint);

    }, [addFrontendNote, transitionToEditorFromPoint, graph])

    const handleThoughtwallDragOver = useCallback(e => {
        e.dataTransfer.dropEffect = "move";
        e.preventDefault();
    }, [])

    return (
        <div 
            className={styles.main} 
            ref={journalWallRef} 
            onClick={handleThoughtwallClicked}
            onDragOver={handleThoughtwallDragOver}
        >
            {orderedNotes.map((note, index) => (
                <Fragment key={note.id}>
                    <BigNote 
                        noteAndIndex={{ note, index }} 
                        onClick={onCenterNoteClick}
                        onMount={onNoteMount}
                        inlineStyle={Point.toInlineStyle(orderedNotePointsById[note?.id])}
                        // defaultPoint={getCenterPoint(i)}
                        isSelected={selected?.note?.id === note.id}
                    />
                    {getConnectingNotes(note)?.map(({ v }) => (
                        <Connection 
                            pointFrom={orderedNotePointsById[note?.id]}
                            pointTo={orderedNotePointsById[v?.id]}
                            stroke={RED}
                            strokeWidth={3}
                            key={`conn~${note?.id}-${v?.id}`}
                        />
                    ))}
                </Fragment>
            ))}
            {/* independentNotes?.map(({ note, graphIndex, connections }, i) => getCenterPoint(i) ? (
                <Fragment key={note.id}>
                    <Line 
                        length={i !== independentNotes.length - 1 ? getNoteWallGapFromUserOrderIndex(graph, orderedNotes, graphIndex) : 200} 
                        rotateOrigin={lineOrigin(i)} 
                        animation={false}
                        color={i !== independentNotes.length - 1 ? RED : 'transparent'}
                        thickness={3}
                    />
                    <BigNote 
                        noteAndIndex={{ note, index: graphIndex }} 
                        onClick={onCenterNoteClick}
                        onMount={onNoteMount}
                        defaultPoint={getCenterPoint(i)}
                        isSelected={selected?.note?.id === note.id}
                    />
                    {/* {connections.map(({ v }) => (
                        <Connection 
                            idFrom={note?.id}
                            idTo={v?.id}
                            color={'blue'}
                        />
                    ))} */}
                    {/* <NoteWall 
                        note={note}
                        index={graphIndex}
                        centerPoint={getCenterPointgetCenterPoint(i)}
                        connectingNotes={getConnectingNotes(graphIndex)}
                        onNoteMount={onNoteMount}
                        onNoteClick={onCenterNoteClick}
                        onConnectionClick={onConnectionClick}
                        tabIndex={100 + i}
                        selected={selected}
                    /> */}
                {/* </Fragment> */}
            {/* ) : null)} */}
        </div>
    )
}

export default ThoughtWall;