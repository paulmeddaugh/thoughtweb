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

    const { graph } = useNoteGraph();
    const { selected, setSelectedNote } = useSelected();
    const { orderedNotes } = useNoteOrder();
    const { isPinned: isNoteboxPinned } = useNotebox();

    const scrollToMap = useRef(new Map()).current;
    
    const journalWallRef = useRef(null);
    
    let navigate = useNavigate();

    const [independentNotes, centerPoints] = useMemo(() => {
        let centerPointsArr = [], 
            prevPointIndex = 0;
        const independentNotes = orderedNotes.concat()
            .filter(note => {
                // Base filter that the centering note either must be 'main'
                if (note.main !== true) return false;

                // Any custom filters if not already filtered
                // return Object.entries(filters).every(([type, filter]) => {
                //     return filterValidators[type](note, filter);
                // })
                return filterValidators.notebook(note, selected.notebookId);
            })
            .map((note, i, filteredNotes) => {
                // Dynamically creates centerPoint list
                const count = centerPointsArr.length;
                const prevNoteConnSize = graph.getVertexNeighborsWithWeightZero(
                    filteredNotes[prevPointIndex]
                ).length;
                const connSize = graph.getVertexNeighborsWithWeightZero(note).length;

                const point = (!count) 
                    ? new Point( // Starting point if empty
                        NOTE_WALL_X_START, 
                        NOTE_WALL_Y_START
                    ) : new Point(
                        centerPointsArr[count - 1].x + (getNoteWallGap(prevNoteConnSize) / 2) + (getNoteWallGap(connSize) / 2), 
                        NOTE_WALL_Y_START
                    );
                centerPointsArr.push(point);
                scrollToMap.set(note.id, centerPointsArr[count]); // Adds point as the scrollTo point 
                return { // Stores the note and index
                    note, 
                    graphIndex: prevPointIndex = i
                };
            });
        return [independentNotes, centerPointsArr];
    }, [graph, orderedNotes, scrollToMap, selected.notebookId]);

    useLayoutEffect(() => {
        if (selected?.scrollTo === false || !selected?.note?.main) return;

        const notePoint = scrollToMap.get(selected.note?.id);
        if (!notePoint) return;

        let { width: thoughtWallWidth, height: thoughtWallHeight } = journalWallRef.current.getBoundingClientRect();

        const isNoteBoxFilled = isNoteboxPinned && (window.innerWidth < WINDOW_WIDTH_TO_FILL);
        if (isNoteBoxFilled) thoughtWallWidth = window.innerWidth;

        const noteDims = {
            width: selected.note?.main ? 0 : STICKY_NOTE_SIZE.width,
            height: selected.note?.main ? 0 : STICKY_NOTE_SIZE.height
        };

        setTimeout(() => {
            journalWallRef.current.scrollTo({
                left: notePoint.x - (thoughtWallWidth / 2) + noteDims.width / 2, 
                top: notePoint.y - (thoughtWallHeight / 2) + noteDims.height / 2,
                behavior: 'smooth' 
            });
        }, 0);
    }, [selected, journalWallRef]);

    const getCenterPoint = (i) => centerPoints[i];

    // Determines position of the lines that connect each centered, or 'independent,' note
    const lineOrigin = (i) => {
        const { x: left, y: top } = getCenterPoint(i) || {};
        return left !== undefined ? { left, top: top + CENTER_LINE_X_OFFSET } : {};
    }

    const getConnectingNotes = (graphIndex, includeFromNotes = true) => {

        // Confirms valid graphIndex value of userOrderIndex
        if (typeof graphIndex !== 'number') return [];

        // Ids of all connections
        const connIds = (includeFromNotes)
            ? graph.getVertexNeighbors(graphIndex)
            : graph.getVertexNeighborsWithWeightZero(graphIndex)
        console.log('thoughtwall connIds', connIds, graphIndex);
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

    const onNoteMount = (note, userOrderIndex, point) => {
        // Adds the scrollPoint of each note if not already set
        if (!scrollToMap.has(note.id)) scrollToMap.set(note.id, point);
    } 

    const onCenterNoteClick = useCallback((note, userOrderIndex, point) => {
        const graphIndex = graph.indexOf(orderedNotes[userOrderIndex]);
        setTimeout(() => {
            setSelectedNote(note, graphIndex);
        }, 50);
    }, [graph, orderedNotes, setSelectedNote])

    const onCenterNoteDoubleClick = (note, userOrderIndex, point) => {
        navigate('/editor');
    }

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
                onNoteDoubleClick={onCenterNoteDoubleClick}
                onConnectionClick={onConnectionClick}
                originBigNoteIdStack={bigNoteIdStack}
                selected={selected}
                extendBoundaryBy={75}
                isCloseable={onCloseHandler ? true : false}
                onClose={onCloseHandler ? onCloseHandler : null}
            />
        );
    };

    return (
        <div className={styles.main} ref={journalWallRef}>
            {independentNotes?.map(({ note, graphIndex }, i) => getCenterPoint(i) ? (
                <Fragment key={note.id}>
                    <Line 
                        length={i !== independentNotes.length - 1 ? getNoteWallGapFromUserOrderIndex(graph, orderedNotes, graphIndex) : 200} 
                        rotateOrigin={lineOrigin(i)} 
                        animation={false}
                        color={i !== independentNotes.length - 1 ? RED : 'transparent'}
                        thickness={3}
                    />
                    <NoteWall 
                        note={note}
                        index={graphIndex}
                        centerPoint={getCenterPoint(i)}
                        connectingNotes={getConnectingNotes(graphIndex)}
                        onNoteMount={onNoteMount}
                        onNoteClick={onCenterNoteClick}
                        onNoteDoubleClick={onCenterNoteDoubleClick}
                        onConnectionClick={onConnectionClick}
                        tabIndex={100 + i}
                        selected={selected}
                    />
                </Fragment>
            ) : null)}
        </div>
    )
}

export default ThoughtWall;