import { Fragment, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { binarySearch } from '../../scripts/utility/utility';
import styles from '../../styles/ThoughtWall/ThoughtWall.module.css';
import NoteWall from "./NoteWall";
import Point from '../../scripts/notes/point';
import Line from "./Line";
import { useFilters, useGraph, useSelected, useSetSelected, useUserOrder } from "../LoginProvider";
import { comparePositions } from "../../scripts/utility/customOrderingAsStrings";
import { useSharedState } from "../../hooks/useGlobalState";
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

const filtersMap = {
    notebook: (note, nbId) => note.idNotebook === Number(nbId),
};

const NOTE_WALL_GAP_BY_CONN_NUMBER = {
    0: NOTE_WALL_GAP * .5,
    1: NOTE_WALL_GAP * .7,
    2: NOTE_WALL_GAP * .8,
};

const getNoteWallGap = (connectionCount) => NOTE_WALL_GAP_BY_CONN_NUMBER[connectionCount] ?? NOTE_WALL_GAP;
const graphIndexFromUserOrder = (userOrder, userOrderIndex) => userOrder[userOrderIndex].graphIndex;

const getNeighborsOfUserOrderIndex = (graph, userOrder, userOrderIndex) => {
    return graph.getVertexNeighborsWithWeightZero(graphIndexFromUserOrder(userOrder, userOrderIndex));
}

const getNoteWallGapFromUserOrderIndex = (graph, userOrder, userOrderIndex) => {
    const connCount = getNeighborsOfUserOrderIndex(graph, userOrder, userOrderIndex).length;
    return getNoteWallGap(connCount);
}

const ThoughtWall = () => {

    const graph = useGraph();
    const selected = useSelected(), setSelected = useSetSelected();
    const filters = useFilters();
    const userOrder = useUserOrder();

    const [independentNotes, setIndependentNotes] = useState([]);
    const scrollToMap = useRef(new Map()).current;
    
    const [centerPoints, setCenterPoints] = useState([]);

    const journalWallRef = useRef(null);

    const [isNoteboxPinned] = useSharedState('notebox/isPinned');

    let navigate = useNavigate();

    useLayoutEffect(() => { // Determines the notes to put as the center of the webs

        // Pulls notes from userOrder to match with custom ordering
        const arr = userOrder.map((orderObj) => graph.getVertex(orderObj.graphIndex));

        // Determines center notes for each NoteWall: O(n)
        let centerPointsArr = [], prevPointIndex = 0, arrLen = arr.length;
        for (let i = 0, deleteCount = 0; i < arrLen - deleteCount; i++) {

            // Base filter that the centering note either must be 'main'
            let filtered = (arr[i].main !== true);

            // Any custom filters if not already filtered
            if (!filtered) for (let type in filters) {
                filtered = (!filtersMap[type](arr[i], filters[type]));
            }

            if (filtered) { // Removes
                arr.splice(i--, 1);
                deleteCount++;

            } else {
                // Dynamically creates centerPoint list
                const count = centerPointsArr.length;
                const prevNoteConnSize = getNeighborsOfUserOrderIndex(graph, userOrder, prevPointIndex).length;
                const connSize = getNeighborsOfUserOrderIndex(graph, userOrder, i + deleteCount).length;

                const point = (!count) ? 
                      new Point(NOTE_WALL_X_START, NOTE_WALL_Y_START) // Starting point if empty
                    : new Point(
                        centerPointsArr[count - 1].x + (getNoteWallGap(prevNoteConnSize) / 2) + (getNoteWallGap(connSize) / 2), 
                        NOTE_WALL_Y_START
                    );
                centerPointsArr.push(point);
                scrollToMap.set(arr[i].id, centerPointsArr[count]); // Adds point as the scrollTo point 
                arr[i] = { note: arr[i], index: prevPointIndex = i + deleteCount }; // Stores the note and index
            }
        }

        setIndependentNotes(arr.concat());
        setCenterPoints(centerPointsArr.concat());
        
    }, [graph, filters]);

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

    const getConnectingNotes = (userOrderIndex, includeFromNotes = false) => {

        // Confirms valid graphIndex value of userOrderIndex
        const graphIndex = userOrder[userOrderIndex]?.graphIndex;
        if ([undefined, null].includes(graphIndex)) return [];

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
            const order = connNote.allNotesPosition;
            const [ , index ] = binarySearch(userOrder, order, 0, 'order', comparePositions);

            return { note: connNote, index, weight };
        });

        return connectingNotes;
    }

    const onNoteMount = (note, userOrderIndex, point) => {
        // Adds the scrollPoint of each note if not already set
        if (!scrollToMap.has(note.id)) scrollToMap.set(note.id, point);
    } 

    const onCenterNoteClick = (note, userOrderIndex, point) => {
        setTimeout(() => setSelected({ note, index: userOrder[userOrderIndex].graphIndex }), 50);
    }

    const onCenterNoteDoubleClick = (note, userOrderIndex, point) => {
        navigate('/editor');
    }

    const onConnectionClick = (note, userOrderIndex, point, bigNoteIdStack, onCloseHandler) => {

        const graphIndex = userOrder[userOrderIndex].graphIndex;

        // Scrolls to note on wall rather than create new one if 'Main' type
        if (note.main && bigNoteIdStack.length !== 0) {
            setSelected({ note, index: graphIndex });
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
                connectingNotes={getConnectingNotes(userOrderIndex, true)}
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
            {independentNotes?.map((noteAndIndex, i) => getCenterPoint(i) ? (
                <Fragment key={i}>
                    <Line 
                        length={i !== independentNotes.length - 1 ? getNoteWallGapFromUserOrderIndex(graph, userOrder, noteAndIndex.index) : 200} 
                        rotateOrigin={lineOrigin(i)} 
                        animation={false}
                        color={i !== independentNotes.length - 1 ? RED : 'transparent'}
                        thickness={3}
                    />
                    <NoteWall 
                        noteAndIndex={noteAndIndex}
                        centerPoint={getCenterPoint(i)}
                        connectingNotes={getConnectingNotes(noteAndIndex.index)}
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