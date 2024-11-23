import styles from '../../styles/ThoughtWall/Note.module.css';
import bigStyles from '../../styles/ThoughtWall/BigNote.module.css';
import { useEffect, forwardRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Point from '../../scripts/notes/point';

const dateFormatted = (date) => new Date(date).toLocaleDateString('en-us', { month:"short", day:"numeric" });

const BigNote = ({ noteAndIndex, inlineStyle, onClick, onDoubleClick, onMount, isSelected, onMouseEnter, 
    onMouseLeave, isConnectedNote, noConnections, children }, ref) => {

    const navigate = useNavigate();

    const { note, index, main, title, text, quotes, dateCreated } = useMemo(() => {
        return { 
            note: noteAndIndex?.note ?? {}, 
            index: noteAndIndex?.index ?? null,
            ...(noteAndIndex?.note ?? {}),
        };
    }, [noteAndIndex]);

    useEffect(() => {
        const point = (inlineStyle.left && inlineStyle.top) ? new Point(inlineStyle.left, inlineStyle.top) : null;
        onMount?.(note, index, point);
    }, [index, inlineStyle.left, inlineStyle.top, note, onMount]);

    const handleClicked = () => {
        const point = (inlineStyle.left && inlineStyle.top) ? new Point(inlineStyle.left, inlineStyle.top) : null;
        onClick?.(note, index, point);
    }

    // const handleDoubleClick = () => {
    //     const point = (inlineStyle.left && inlineStyle.top) ? new Point(inlineStyle.left, inlineStyle.top) : null;
    //     onDoubleClick?.(note, index, point);
    // }

    const handleFullscreenIconClick = e => {
        navigate("/editor");
    }

    return (
        <>
            <div 
                className={`${bigStyles[main ? 'mainNote' : 'stickyNote']} ${noConnections && bigStyles.noConnections}`}
                style={inlineStyle}
                onClick={handleClicked}
                // onDoubleClick={handleDoubleClick}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                ref={ref}
            >
                <div className={`${bigStyles.content} ${bigStyles[main ? 'contentMain' : 'contentSticky']}`}>
                    {title && (
                        <div className={bigStyles.titleContainer}>
                            <div 
                                className={[
                                    styles.noteTitle, 
                                    bigStyles.noteTitle, 
                                    isSelected ? styles.selected : '', 
                                    isConnectedNote ? bigStyles.connectedNote : ''
                                ].join(' ')}
                            >
                                {title}
                            </div>
                            <div 
                                className={bigStyles.fullscreenIcon}
                                onClick={handleFullscreenIconClick}
                            />
                        </div>
                    )}
                    {text && (
                        <div className={bigStyles.noteText}>
                            {text}
                            {quotes && (
                                <div className={bigStyles.noteQuotes}>{quotes}</div>
                            )}
                        </div>
                    )}
                </div>
                {children}
            </div>
            <div className={bigStyles.noteDate}>
                {dateFormatted(dateCreated)}
            </div>
        </>
    )
}

export default forwardRef(BigNote);