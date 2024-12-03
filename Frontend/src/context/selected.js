import { createContext, useCallback, useContext, useState } from "react";

const SelectedContext = createContext(null);

export const SelectedProvider = ({ children }) => {
    const [selected, setSelected] = useState({}); // { note, index, notebookId }
    const [newNoteId, setNewNoteId] = useState(-1);

    const setSelectedNote = useCallback((note, graphIndex) => {
        setSelected(({ willSelectFirstOrderedNote, ...prev }) => ({ ...prev, note, index: graphIndex }));
    }, [setSelected])

    const setSelectedNotebook = useCallback((notebookId) => {
        setSelected(prev => ({ ...prev, notebookId: notebookId && Number(notebookId), willSelectFirstOrderedNote: true }));
    }, [setSelected])

    const isSelectedNoteEdited = useCallback((edited) => {
        setSelected(prev => ({ ...prev, edited }));
    }, [])
    return (
        <SelectedContext.Provider value={{ 
            selected,
            setSelectedNote,
            setSelectedNotebook,
            isSelectedNoteEdited,
            newNoteId,
            setNewNoteId,
        }}>
            {children}
        </SelectedContext.Provider>
    );
}

export function useSelected() {
    return useContext(SelectedContext);
}