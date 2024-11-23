import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../../styles/Editor/CreateNoteButton.module.css';
import { useNoteGraph } from '../../context/noteGraph';
import { useSelected } from '../../context/selected';
import Note from '../../scripts/notes/note';

const LABEL_DISAPPEAR_SEC = 8;

const classes = {
    '/editor~true': styles.brownLabel,
    '/editor~false': styles.brownIcon,
    '/~true': styles.whiteLabel,
    '/~false': styles.whiteIcon,
}

const CreateNoteButton = ({ onClick }) => {

    const location = useLocation();
    const [labelShow, setLabelShow] = useState(true);
    const { graph, setGraph } = useNoteGraph();
    const { setSelectedNote, newNoteId, setNewNoteId } = useSelected();

    const handleClicked = useCallback((e) => {
        /* Resets the new note id decrementing count to -1 if clicked away from editor,
         * as the Editor deletes all unsaved notes when unmounting for efficiency. */ 
        const newId = (location.pathname !== '/editor') ? -1 : newNoteId;
        const newNote = new Note(newId, '', '', '', null, true, new Date(), null);

        graph.addVertex(newNote);
        setGraph(graph.clone());

        setNewNoteId(newId - 1); // Decrements new id count
        setSelectedNote(newNote, graph.size() - 1);
    }, [graph, location.pathname, newNoteId, setGraph, setNewNoteId, setSelectedNote])

    useEffect(() => {
        setTimeout(() => setLabelShow(false), LABEL_DISAPPEAR_SEC * 1000)
    }, []);

    return (
        <Link 
            to='/editor' 
            id={styles.add} 
            className={classes[`${String(location.pathname)}~${String(labelShow)}`]} 
            onClick={handleClicked}
        />
    );
}

export default CreateNoteButton;