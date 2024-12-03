import { forwardRef } from 'react';
import { ListGroupItem } from 'react-bootstrap';
import styles from '../../styles/NoteBox/NoteBoxNote.module.css';
import { useSelected } from '../../context/selected';

const isNoteActive = (selected, note, dragging) => selected.note?.id === note?.id && !dragging;
const handlerWithNoteAndIndex = (func, note, index) => (e) => func?.(e, note, index);

const NoteBoxNote = ({ note, index, onSelect, onDoubleClick, onNoteDragStart, onNoteDrag, onNoteDrop, onDelete, dragging, style }, ref) => {

    const { selected } = useSelected();
    const isUnsavedEditedNote = selected.edited && isNoteActive(selected, note, dragging);

    return (
        <ListGroupItem
            as="a"
            onClick={handlerWithNoteAndIndex(onSelect, note, index)}
            onDoubleClick={handlerWithNoteAndIndex(onDoubleClick, note, index)}
            onTouchEnd={handlerWithNoteAndIndex(onSelect, note, index)}
            onDragStart={handlerWithNoteAndIndex(onNoteDragStart, note, index)}
            onDrag={handlerWithNoteAndIndex(onNoteDrag, note, index)}
            onDragEnd={handlerWithNoteAndIndex(onNoteDrop, note, index)}
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
                <div className={styles.removeNote} onClick={handlerWithNoteAndIndex(onDelete, note, index)} />
            ) : null}
        </ListGroupItem>
    )
}

export default forwardRef(NoteBoxNote);