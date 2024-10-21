import styles from '../../styles/Editor/EditorConnection.module.css';
import { useState, useRef } from "react";

const AddConnection = ({ currentNoteId, noteList, onAddConnection, disabled, className, lineClassName, ...props }) => {

    const [addClicked, setAddClicked] = useState(false);
    const selectRef = useRef(null);

    const showSelect = () => {
        if (!addClicked) setAddClicked(true);
        selectRef.current.focus();
    };

    const hideSelect = () => {
        if (addClicked) setAddClicked(false);
    }

    const notePicked = (e) => {
        const selectedId = e.target.options[e.target.selectedIndex].getAttribute('data-id');
        const selectedTitle = e.target.options[e.target.selectedIndex].value;
        onAddConnection(selectedId, selectedTitle);
        setAddClicked(false);
        selectRef.current.value = 'Select Note';
    }

    return (
        <div className={`${className} flex zIndex1 relative`} {...props}>
            <div className={`${lineClassName} ${styles.line}`} />
            <div className={styles.noteContainer + ' flex-center'} onMouseDown={!disabled ? showSelect : null}>
                <div className={!addClicked ? styles.plusContainer : 'display-none'}>
                    <div className={styles.plus}>+</div>
                </div>
                <select 
                    className={!addClicked ? `opacity001 ${styles.select}` : `${styles.select} ${styles.to85WidthAnim}`} 
                    onBlur={hideSelect}
                    onChange={notePicked}
                    defaultValue={'Select Note'}
                    disabled={disabled}
                    ref={selectRef}
                >
                    <option value={'Select Note'}>Select Note</option>
                    {noteList.map((note, i) => (note.id >= 0 && note.id !== currentNoteId) ? (
                        <option value={note.title} data-id={note.id} key={i}>
                            {note.title}
                        </option>
                    ) : null)}
                </select>
            </div>
        </div>
    );
}

export default AddConnection;