import { createContext, useCallback, useContext, useState } from "react";

const NoteboxContext = createContext(null);

const THOUGHTWALL_TO_EDITOR_TRANSITION_MILLIS = 600;

export const NoteboxProvider = ({ children }) => {
    const [isPinned, setPinned] = useState(true);
    const [transitioningFromEditorProps, setTransitioningFromEditorProps] = useState(null);
    const transitionToEditorFromPoint = useCallback((point, onFullscreen, onFinish, transitionMilliseconds) => {
        setTransitioningFromEditorProps({
            point,
            onFullscreen,
            onFinish,
            transitionMilliseconds: transitionMilliseconds ?? THOUGHTWALL_TO_EDITOR_TRANSITION_MILLIS,
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