import { createContext, useContext, useMemo } from "react";
import Point from "../scripts/notes/point";

import { useNoteOrder } from "./noteOrder";
import { 
    NOTE_WALL_GAP, 
    NOTE_WALL_X_START, 
    NOTE_WALL_Y_START
} from "../constants/constants";

const NotePointsContext = createContext(null);

export function NotePointsProvider ({ children }) {
    const { orderedNotes } = useNoteOrder();
    const orderedNotePointsById = useMemo(() => {
        let maxX = 0;
        return orderedNotes?.reduce((orderedNotePointsById, n, i) => {
            const isPointSet = (n?.point && !Point.isCoordinatesZeroZero(n))
            if (!i) {
                orderedNotePointsById[n?.id] = (isPointSet)
                    ? n.point
                    : new Point(NOTE_WALL_X_START, NOTE_WALL_Y_START)
            } else {
                orderedNotePointsById[n?.id] = (isPointSet) 
                ? n.point
                : new Point(maxX + NOTE_WALL_GAP, NOTE_WALL_Y_START);
            }

            maxX = Math.max(maxX, orderedNotePointsById[n?.id].x);
            return orderedNotePointsById;
        }, {})
    }, [orderedNotes])
    return (
        <NotePointsContext.Provider value={{ orderedNotePointsById }}>
            {children}
        </NotePointsContext.Provider>
    )
}

export const useNotePoints = () => useContext(NotePointsContext);