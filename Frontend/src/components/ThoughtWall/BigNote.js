import styles from '../../styles/ThoughtWall/Note.module.css';
import bigStyles from '../../styles/ThoughtWall/BigNote.module.css';
import { useEffect, forwardRef, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Point from '../../scripts/notes/point';
import { useNotePoints } from '../../context/notePoints';
import { useNoteGraph } from '../../context/noteGraph';
import { useSelected } from '../../context/selected';

const dateToMonthDayString = (date) => new Date(date).toLocaleDateString('en-us', { month:"short", day:"numeric" });

const BigNote = ({ 
    noteAndIndex,
    defaultPoint,
    inlineStyle,
    onClick,
    onMount,
    isSelected,
    onMouseEnter,
    onMouseLeave,
    isConnectedNote,
    children
}, ref) => {
    const { note, index, main, title, text, quotes, dateCreated } = useMemo(() => {
        return { 
            note: noteAndIndex?.note ?? {}, 
            index: noteAndIndex?.index ?? null,
            ...(noteAndIndex?.note ?? {}),
        };
    }, [noteAndIndex]);
    const { updateNote } = useNoteGraph();
    const navigate = useNavigate();
    const { setSelectedNote } = useSelected()
    const [draggingProps, setDraggingProps] = useState(null);
    const point = note.point && !Point.isCoordinatesZeroZero(note.point)
        ? note.point
        : defaultPoint;

    useEffect(() => {
        onMount?.(note, index, Point.fromInlineStyle(inlineStyle));
    }, [index, inlineStyle, note, onMount]);

    const handleClicked = e => {
        onClick?.(note, index, Point.fromInlineStyle(inlineStyle));
    }

    const handleDragStart = e => {
        const { left, top, width, height } = e.target.getBoundingClientRect();
        setDraggingProps({
            startCenterOffsetX: e.clientX - left - (width / 2),
            startCenterOffsetY: e.clientY - top - (height / 2),
        })
    };
    const handleDragEnd = async e => {
        e.preventDefault();
        const thoughtwall = e.target.parentElement;
        const { left, top } = thoughtwall.getBoundingClientRect();
        const { startCenterOffsetX, startCenterOffsetY } = draggingProps;
        note.point = new Point(
            e.clientX - startCenterOffsetX - parseInt(left) + thoughtwall.scrollLeft,
            e.clientY - startCenterOffsetY - parseInt(top) + thoughtwall.scrollTop,
        );
        setSelectedNote(note, index);
        await updateNote(note);
        setDraggingProps(null);
    }

    const handleFullscreenIconClick = e => {
        navigate("/editor");
    }

    return (
        <>
            <div 
                className={[
                    bigStyles[main ? 'mainNote' : 'stickyNote'],
                    draggingProps ? bigStyles.dragging : '',
                ].join(' ')}
                style={Point.toInlineStyle(point)}
                onClick={handleClicked}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                draggable="true"
                ref={ref}
            >
                <div className={`${bigStyles.content} ${bigStyles[main ? 'contentMain' : 'contentSticky']} grabbable`}>
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
                <div className={bigStyles.noteDate}>
                    {dateToMonthDayString(dateCreated)}
                </div>
                <div className={bigStyles.iconContainer}>
                    <div 
                        className={bigStyles.fullscreenIcon}
                        onClick={handleFullscreenIconClick}
                    />
                </div>
                {children}
            </div>
            
        </>
    )
}

export default forwardRef(BigNote);