import styles from '../../styles/NoteBox/NoteBoxNotebook.module.css';
import axios from 'axios';

const NoteBoxNotebook = ({ notebook, liftSelectProps, onDeleteClick, onAddClick }) => {

    const select = () => {
        liftSelectProps?.({ // Lifts props 
            optionInnerHTML: notebook.name, 
            'optionData-idnotebook': notebook.id, 
            nbOptionsVisible: false 
        });
    };

    const deleteNotebook = (e) => {
        if (!window.confirm("Are you sure you want to delete notebook '" + notebook.name + "' and all of its notes?")) {
            return;
        }

        // Delete on frontend
        onDeleteClick?.(notebook);

        e.preventDefault();
    };

    const addNotebook = (e) => {
        onAddClick?.();
        e.preventDefault();
    }

    return (
        <div 
            className={styles.nbOption} 
            data-idnotebook={notebook.id} 
            onClick={select}
        >
            {notebook.name}
            {notebook.name !== 'All Notebooks' ? (
                <div className={styles.removeNb} onClick={deleteNotebook} />
            ) : (
                <div className={styles.addNb} onClick={addNotebook} />
            )}
        </div>
    )
}

export default NoteBoxNotebook;