import { useEffect, useRef, useState } from "react";
import siteStyles from '../../styles/App.module.css';
import NoteBox from "./NoteBox";
import CustomConfirm from "../CustomConfirm";

const NoteBoxLayout = ({ children }) => {

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