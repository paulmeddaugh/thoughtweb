import { useEffect, forwardRef, useRef } from 'react';
import Point from '../../scripts/notes/point';
import styles from '../../styles/ThoughtWall/Note.module.css';

const tackImg = require('../../resources/tack.png');

const Note = ({ noteAndIndex, onClick, onDoubleClick, onMount, isSelected, inlineStyle, isConnection }, ref) => {

    const noteRef = useRef(null);

    useEffect(() => {
        const point = (inlineStyle?.left && inlineStyle?.top) ?
            new Point(inlineStyle.left, inlineStyle.top) : null;
        const { left, top } = noteRef?.current?.getBoundingClientRect();
        onMount?.(noteAndIndex.note, noteAndIndex.index, new Point(left, top));
    }, []);

    const clicked = (e, singleClick = true) => {
        const { left, top } = noteRef.current?.getBoundingClientRect();
        if (singleClick) {
            onClick?.(noteAndIndex.note, noteAndIndex.index, new Point(left, top));
        } else {
            onDoubleClick?.(noteAndIndex.note, noteAndIndex.index, new Point(left, top));
        }
    }

    return (
        <div 
            id={noteAndIndex.note.id}
            className={(noteAndIndex?.note.main ? styles.mainNote : styles.stickyNote) + ' '
                + (isConnection ? styles.connectionNote : '')} 
            style={inlineStyle}
            onClick={(e) => clicked(e)}
            onDoubleClick={(e) => clicked(e, false)}
            ref={(el) => {noteRef.current = el; ref?.(el)}}
        >
            {!!noteAndIndex?.note.title && 
                <div className={styles.noteTitle + (isSelected ? ' ' + styles.selected : '')}>
                    {noteAndIndex?.note.title}
                </div>
            }
            {(!!noteAndIndex?.note.text || !!noteAndIndex?.note.quotes) && 
                <div className={`${styles.noteText} ${isConnection ? styles.connectionText : ''}`}>
                    {noteAndIndex?.note.text}
                    {!!noteAndIndex?.note.quotes && <div className={`${styles.noteQuotes}`}>
                        {noteAndIndex?.note.quotes}
                    </div>}
                </div>
            }
            {!isConnection && <div className={styles.connectionWallInfo}>
                Click to view connections
            </div>}
        </div>
    )
}

export default forwardRef(Note);