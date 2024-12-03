import { createContext, useCallback, useContext, useState } from "react";

const NoteboxContext = createContext(null);

export const NoteboxProvider = ({ children }) => {
    const [isPinned, setPinned] = useState(true);
    const [transitioningFromEditorProps, setTransitioningFromEditorProps] = useState(null);
    const transitionToEditorFromPoint = useCallback((selectingNote, selectingIndex, point) => {
        setTransitioningFromEditorProps({
            point,
            selectingNote,
            selectingIndex,
        });
    }, []);
    const resetTransitionToEditor = useCallback(() => {
        setTransitioningFromEditorProps(null);
    }, [])
    return (
        <NoteboxContext.Provider value={{ 
            isPinned, 
            setPinned, 
            transitioningFromEditorProps, 
            transitionToEditorFromPoint,
            resetTransitionToEditor,
        }}>
            {children}
        </NoteboxContext.Provider>
    )
}

export function useNotebox() {
    return useContext(NoteboxContext);
}