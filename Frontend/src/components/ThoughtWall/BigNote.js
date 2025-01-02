import styles from '../../styles/ThoughtWall/Note.module.css';
import bigStyles from '../../styles/ThoughtWall/BigNote.module.css';
import { useEffect, forwardRef, useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Point from '../../scripts/notes/point';
import { useNotePoints } from '../../context/notePoints';
import { THOUGHTWALL_NOTE_DRAG_MODES } from '../../constants/constants';
import { RED } from '../../constants/colors';
import { svgToDataUri } from '../../scripts/utility/utility';

const dateToMonthDayString = (date) => new Date(date).toLocaleDateString('en-us', { month:"short", day:"numeric" });

const BigNote = ({ 
    note,
    index,
    inlineStyle,
    onClick,
    isSelected,
    isHovering,
    onMouseEnter,
    onMouseLeave,
    onDragStart,
    onDrag,
    onDragEnd,
    onDragModeIconClick,
    dragMode,
    isConnectedNote,
    children
}, ref) => {
    const { main, title, text, quotes, dateCreated } = note;
    const { orderedNotePointsById } = useNotePoints();
    const point = orderedNotePointsById[note?.id] ?? note?.point;
    const [classNames, setClassNames] = useState('');
    
    const navigate = useNavigate();

    const handleClicked = useCallback(e => {
        onClick?.(note, index, Point.fromInlineStyle(inlineStyle));
    }, [index, inlineStyle, note, onClick])

    const handleDragStart = useCallback(e => {
        onDragStart?.(e, note, index);
        if (dragMode === THOUGHTWALL_NOTE_DRAG_MODES.CONNECTION) {
            const dataTransferImageDiv = document.getElementById('dataTransferImage');
            const svgAsDataUri = svgToDataUri(`
                <svg width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="10" cy="10" r="10" fill="${RED}" />
                </svg>
            `.trim());
            dataTransferImageDiv.style.backgroundImage = `url("${svgAsDataUri}")`;
            e.dataTransfer.setDragImage(dataTransferImageDiv, 10, 10);
            
            return;
        } else {
            setClassNames(bigStyles.dragging);

        }
    }, [dragMode, index, note, onDragStart]);

    const handleDrag = useCallback(e => {
        onDrag?.(e, note, index);
    }, [index, note, onDrag]);

    const handleDragEnd = useCallback(async e => {
        onDragEnd?.(e, note, index);
        if (dragMode === THOUGHTWALL_NOTE_DRAG_MODES.CONNECTION) return;
        setClassNames(`${bigStyles.draggingShow} ${bigStyles.hover}`);
    }, [dragMode, index, note, onDragEnd])

    useEffect(() => {
        if (classNames === `${bigStyles.draggingShow} ${bigStyles.hover}`) {
            setClassNames('');
        }
    }, [classNames])

    const handleFullscreenIconClick = useCallback(e => navigate("/editor"), [navigate])
    const handleDragModeClick = useCallback(e => {
        onDragModeIconClick?.(e, note, index)
    }, [index, note, onDragModeIconClick])

    return (
        <div 
            className={[
                bigStyles[main ? 'mainNote' : 'stickyNote'],
                isHovering ? bigStyles.hover : '',
                classNames
            ].join(' ')}
            style={Point.toInlineStyle(point)}
            onClick={handleClicked}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onDragStart={handleDragStart}
            onDrag={handleDrag}
            onDragEnd={handleDragEnd}
            draggable="true"
            ref={ref}
        >
            <div className={`${bigStyles.content} grabbable`}>
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
                    className={`${bigStyles.icon} ${bigStyles.fullscreenIcon}`}
                    onClick={handleFullscreenIconClick}
                />
                <div 
                    className={[
                        bigStyles.icon,
                        dragMode === THOUGHTWALL_NOTE_DRAG_MODES.NOTE
                            ? bigStyles.noteDragIcon
                            : bigStyles.connectionDragIcon
                    ].join(' ')}
                    onClick={handleDragModeClick}
                ></div>
            </div>
            {children}
        </div>
    )
}

export default forwardRef(BigNote);