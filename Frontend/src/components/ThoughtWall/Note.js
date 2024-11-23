import { useEffect, forwardRef, useRef } from 'react';
import Point from '../../scripts/notes/point';
import styles from '../../styles/ThoughtWall/Note.module.css';

const Note = ({ noteAndIndex, onClick, onDoubleClick, onMount, isSelected, inlineStyle, isConnection }, ref) => {
    const { note, index } = noteAndIndex ?? {};
    const noteRef = useRef(null);

    useEffect(() => {
        const point = (inlineStyle?.left && inlineStyle?.top) 
            ? new Point(inlineStyle.left, inlineStyle.top) 
            : null;
        const { left, top } = noteRef?.current?.getBoundingClientRect();
        onMount?.(note, index, new Point(left, top));
    }, [index, inlineStyle.left, inlineStyle.top, note, onMount]);

    const handleDoubleClick = (e) => {
        return handleClick(e, false);
    }

    const handleClick = (e, singleClick = true) => {
        const { left, top } = noteRef.current?.getBoundingClientRect();
        if (singleClick) {
            onClick?.(note, index, new Point(left, top));
        } else {
            onDoubleClick?.(note, index, new Point(left, top));
        }
    }

    const handleRef = (reference) => {
        noteRef.current = reference; 
        ref?.(reference)
    }

    return (
        <div 
            id={`note-${note.id}`}
            className={[
                note.main ? styles.mainNote : styles.stickyNote,
                isConnection ? styles.connectionNote : ''
            ].join(' ')}
            style={inlineStyle}
            onClick={handleClick}
            onDoubleClick={handleDoubleClick}
            ref={handleRef}
        >
            {!!note.title && (
                <div className={styles.noteTitle + (isSelected ? ' ' + styles.selected : '')}>
                    <span>{note.title}</span>
                </div>
            )}
            {(!!note.text || !!note.quotes) && (
                <div className={styles.noteText}>
                    {note.text}
                    {!!note.quotes && (
                        <div className={`${styles.noteQuotes}`}>
                            {note.quotes}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default forwardRef(Note);