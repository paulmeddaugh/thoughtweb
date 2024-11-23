import { forwardRef } from 'react';
import { ListGroupItem } from 'react-bootstrap';
import styles from '../../styles/NoteBox/NoteBoxNote.module.css';
import { useSelected } from '../../context/selected';

const isNoteActive = (selected, note, dragging) => selected.note?.id === note?.id && !dragging;

const NoteBoxNote = ({ note, index, onSelect, onNoteDragStart, onNoteDrag, onNoteDrop, onDelete, dragging, style }, ref) => {

    const { selected } = useSelected();
    const isUnsavedEditedNote = selected.edited && isNoteActive(selected, note, dragging);

    const handleClick = (e) => onSelect?.(e, note, index);
    const handleDragStart = (e) => {
        onNoteDragStart?.(e, note, index)
    };
    const handleDrag = (e) => onNoteDrag?.(e, note, index);
    const handleDragEnd = (e) => onNoteDrop?.(e, note, index);
    const deleteNote = (e) => (() => onDelete?.(e, note, index))();

    return (
        <ListGroupItem
            as="a"
            onClick={handleClick}
            onTouchEnd={handleClick}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            href={`#${note?.title ?? ''}`}
            style={{ ...style }}
            active={isNoteActive(selected, note, dragging)}
            className={[
                styles.container,
                isUnsavedEditedNote ? styles.unsavedNote : '',
                dragging ? styles.reordering : '',
            ].join(' ')}
            data-idnotebook={note?.idNotebook}
            ref={ref}
        >
            <div className="d-flex justify-content-between">
                <h5 className={styles.title}>
                    {!note?.title ? 'Untitled' : note.title}
                </h5>
                <small className={styles.date}>
                    {new Date(note?.dateCreated).toLocaleDateString('en-us', { month: "short", day: "numeric" })}
                </small>
            </div>
            <div className='d-flex justify-content-between'>
                <p className={`mb-1 ${styles.text}`}>
                    {note?.text !== '' ? note?.text : '-'}
                </p>
                <small className={styles.unsavedNoteText}>
                    {isUnsavedEditedNote ? 'Unsaved' : ''}
                </small>
            </div>
            
            {note?.id !== null && !dragging ? (
                <div className={styles.removeNote} onClick={deleteNote} />
            ) : null}
        </ListGroupItem>
    )
}

export default forwardRef(NoteBoxNote);