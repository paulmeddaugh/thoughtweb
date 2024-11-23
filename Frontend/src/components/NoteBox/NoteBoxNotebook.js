import styles from '../../styles/NoteBox/NoteBoxNotebook.module.css';
import { NOTEBOOK_CONSTANTS } from '../../constants/constants';
import ThreeDotsIcon from '../global/Icons/ThreeDotsIcon';
import { useRef, useState } from 'react';
import Notebook from '../../scripts/notes/notebook';
import PlusIcon from '../global/Icons/PlusIcon';

const NoteBoxNotebook = ({ icon, notebook, onSelected, onDeleteClick, onRenameClick, onAddNotebook }) => {
    const { name, id } = notebook ?? {};
    const isAddNotebookOption = id === NOTEBOOK_CONSTANTS.ADD_A_NEW_NOTEBOOK;
    const isAllNotebooksOption = id === NOTEBOOK_CONSTANTS.ALL_NOTEBOOKS;

    const moreOptionsIconRef = useRef(null);
    const [moreOptionsProps, setMoreOptionsProps] = useState({ isVisible: false });

    const handleSelected = () => {
        if (isAddNotebookOption) {
            onAddNotebook?.();
            return;
        }
        onSelected?.(notebook);
    }

    const handleDeleteClick = (e) => {
        if (!window.confirm("Are you sure you want to delete notebook '" + notebook.name + "' and all of its notes?")) {
            return;
        }

        e.target.blur();
        onDeleteClick?.(notebook);
    }
    const handleRenameClick = (e) => {
        const name = window.prompt("Please enter a new name for the notebook:");
        if (name) {
            const newNotebook = Notebook.clone(notebook).rename(name);
            onRenameClick?.(name, newNotebook);
        }
        moreOptionsIconRef.current.focus();
    }

    const handleMoreOptionsClick = (e) => {
        setMoreOptionsProps(prev => ({ ...prev, isVisible: !prev.isVisible }));
        e.stopPropagation();
    };

    const handleMoreOptionsBlur = (e) => {
        const childGettingFocus = e.relatedTarget?.parentElement?.className === styles.moreOptionsBorder;
        if (!childGettingFocus && moreOptionsProps.isVisible) {
            setMoreOptionsProps(prev => ({ ...prev, isVisible: false }));
        }
    }

    return (
        <div 
            className={[
                styles.nbOption,
                isAddNotebookOption ? styles.addNotebookOption : '',
                moreOptionsProps.isVisible ? styles.activeNbOption : ''
            ].join(' ')} 
            data-idnotebook={id} 
            onClick={handleSelected}
            tabIndex={21}
            onBlur={handleMoreOptionsBlur}
        >
            <span className={styles.text}>
                {name}
            </span>
            {!(isAddNotebookOption || isAllNotebooksOption) && (
                <div 
                    className={styles.moreOptionsIcon} 
                    onClick={handleMoreOptionsClick} 
                    ref={moreOptionsIconRef}
                >
                    <ThreeDotsIcon />
                    <div 
                        className={styles.moreOptionsContainer}
                        style={{ visibility: moreOptionsProps.isVisible ? 'visible' : 'hidden' }}
                    >
                        <div className={styles.moreOptionsBorder}>
                            <div className={styles.moreOptionsRow} onClick={handleRenameClick} tabIndex={22}>
                                Rename
                            </div>
                            <div className={styles.moreOptionsRow} onClick={handleDeleteClick} tabIndex={23}>
                                Delete
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {isAddNotebookOption && (
                <div className={styles.plusIcon}>
                    <PlusIcon />
                </div>
            )}
        </div>
    )
}

export default NoteBoxNotebook;