import { useEffect, forwardRef } from 'react';
import styles from '../../styles/ThoughtWall/Note.module.css';
import bigStyles from '../../styles/ThoughtWall/BigNote.module.css';
import Point from '../../scripts/notes/point';

const BigNote = ({ noteAndIndex, inlineStyle, onClick, onDoubleClick, onMount, isSelected, onMouseEnter, 
    onMouseLeave, isConnectedNote, noConnections, children }, ref) => {

    useEffect(() => {
        const point = (inlineStyle.left && inlineStyle.top) ? new Point(inlineStyle.left, inlineStyle.top) : null;
        onMount?.(noteAndIndex.note, noteAndIndex.index, point);
    }, []);

    const clicked = () => {
        const point = (inlineStyle.left && inlineStyle.top) ? new Point(inlineStyle.left, inlineStyle.top) : null;
        onClick?.(noteAndIndex.note, noteAndIndex.index, point);
    }

    const doubleClicked = () => {
        const point = (inlineStyle.left && inlineStyle.top) ? new Point(inlineStyle.left, inlineStyle.top) : null;
        onDoubleClick?.(noteAndIndex.note, noteAndIndex.index, point);
    }

    return (
        <>
            <div 
                className={(noteAndIndex?.note.main ? bigStyles.mainNote : bigStyles.stickyNote)
                    + ' ' + (noConnections ? bigStyles.noConnections : '')}
                style={inlineStyle}
                onClick={clicked}
                onDoubleClick={doubleClicked}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                ref={ref}
            >
                <div className={`${bigStyles.content} ${noteAndIndex?.note.main ? bigStyles.contentMain : bigStyles.contentSticky}`}>
                    {!!noteAndIndex?.note.title && 
                        <div className={`${styles.noteTitle} ${bigStyles.noteTitle} ${(isSelected ? styles.selected : '')} ${isConnectedNote ? bigStyles.connectedNote : ''}`}>
                            {noteAndIndex?.note.title}
                        </div>
                    }
                    {!!noteAndIndex?.note.text && 
                        <div className={bigStyles.noteText}>
                            {noteAndIndex?.note.text}
                            {!!noteAndIndex?.note.quotes && 
                                <div className={bigStyles.noteQuotes}>{noteAndIndex?.note.quotes}</div>
                            }
                        </div>
                    }
                </div>
                {children}
            </div>
            <div className={bigStyles.noteDate}>
                {new Date(noteAndIndex?.note.dateCreated)
                    .toLocaleDateString('en-us', { month:"short", day:"numeric" })}
            </div>
            <div className={bigStyles.doubleClickLabel}>
               Double click to edit
            </div>
        </>
    )
}

export default forwardRef(BigNote);