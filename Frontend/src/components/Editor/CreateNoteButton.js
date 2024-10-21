import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../../styles/Editor/CreateNoteButton.module.css';

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

    const clicked = (e) => {
        onClick?.(e, location.pathname);
    };

    useEffect(() => {
        setTimeout(() => setLabelShow(false), LABEL_DISAPPEAR_SEC * 1000)
    }, []);

    return (
        <Link 
            to='/editor' 
            id={styles.add} 
            className={classes[`${String(location.pathname)}~${String(labelShow)}`]} 
            onClick={clicked}
        />
    );
}

export default CreateNoteButton;