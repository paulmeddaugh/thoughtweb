import { useEffect, useState } from "react";
import siteStyles from '../../styles/App.module.css';
import NoteBox from "./NoteBox";
import CustomConfirm from "../CustomConfirm";
import { useNotebox } from "../../context/notebox";
import Point from "../../scripts/notes/point";

const TO_EDITOR_TRANSITION_MILLIS = 600;

const NoteBoxLayout = ({ children }) => {

    const { transitioningFromEditorProps, resetTransitionToEditor } = useNotebox();
    const [editorTransitionStyle, setEditorTransitionStyle] = useState(null);

    useEffect(() => {
        if (!transitioningFromEditorProps) return;

        const { onFullscreen, onFinish, point } = transitioningFromEditorProps;
        setEditorTransitionStyle({
            ...Point.toInlineStyle(point),
        });

        const transitionTimeoutId = setTimeout(() => {
            onFullscreen?.();
        }, TO_EDITOR_TRANSITION_MILLIS / 2)

        const fadeTimeoutId = setTimeout(() => {
            resetTransitionToEditor();
            onFinish?.()
        }, TO_EDITOR_TRANSITION_MILLIS);

        return () => {
            clearTimeout(transitionTimeoutId);
            clearTimeout(fadeTimeoutId);
        }
    }, [resetTransitionToEditor, transitioningFromEditorProps])

    // A state for an object that holds 'title', 'message', and 'callback' properties,
    // displaying a model what invokes the callback with the confirm results when set
    const [confirmObj, setConfirmObj] = useState({});

    const customConfirm = (title, message, callback) => {
        setConfirmObj({ title: title, message: message, callback: callback });
    }

    return (
        <div className={siteStyles.body} >
            <div className={siteStyles.main}>
                <NoteBox />
                <div id={siteStyles.content}>
                    {children}
                    {transitioningFromEditorProps && editorTransitionStyle && (
                        <div 
                            style={editorTransitionStyle} 
                            className={siteStyles.editorFullscreenExpander}
                        />
                    )}
                </div>
            </div>
            <CustomConfirm 
                confirmObj={confirmObj} 
                setConfirmObj={setConfirmObj}
            />
        </div>
    )
}

export default NoteBoxLayout;