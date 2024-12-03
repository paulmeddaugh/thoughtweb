import { useEffect, useRef, useState } from "react";
import siteStyles from '../../styles/App.module.css';
import NoteBox from "./NoteBox";
import CustomConfirm from "../CustomConfirm";
import { useNotebox } from "../../context/notebox";
import Point from "../../scripts/notes/point";
import { useNavigate } from "react-router-dom";
import { useSelected } from "../../context/selected";

const TO_EDITOR_TRANSITION_MILLIS = 600;

const NoteBoxLayout = ({ children }) => {

    const { setSelectedNote } = useSelected();
    const { transitioningFromEditorProps, resetTransitionToEditor } = useNotebox();
    const [editorTransitionStyle, setEditorTransitionStyle] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (!transitioningFromEditorProps) return;

        const { selectingNote, selectingIndex, point } = transitioningFromEditorProps;
        setEditorTransitionStyle({
            ...Point.toInlineStyle(point),
        });

        const transitionTimeout = setTimeout(() => {
            navigate('/editor');
            setSelectedNote(selectingNote, selectingIndex);
        }, TO_EDITOR_TRANSITION_MILLIS / 2)

        const fadeTimeout = setTimeout(() => {
            resetTransitionToEditor();
        }, TO_EDITOR_TRANSITION_MILLIS);

        return () => {
            clearTimeout(transitionTimeout);
            clearTimeout(fadeTimeout);
        }
    }, [navigate, resetTransitionToEditor, setSelectedNote, transitioningFromEditorProps])

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