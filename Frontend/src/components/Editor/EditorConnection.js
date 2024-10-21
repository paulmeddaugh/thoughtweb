import styles from '../../styles/Editor/EditorConnection.module.css';

const EditorConnection = ({ note, onRemove, onClick, className, lineClassName, ...props }) => {

    const handleClick = (e) => {
        onClick?.(e, note);
        e.target.blur();
    }
    
    const handleRemoveClick = (e) => {
        e.stopPropagation();
        onRemove?.(e, note);
    };

    return (
        <div className={`${className} d-flex position-relative ${styles.container}`}  onClick={handleClick} {...props}>
            <div className={`${lineClassName} ${styles.line}`} />
            <div className={styles.noteContainer + (!note.main ? ' ' + styles.stickyNote : '')}>
                <div className={styles.title}>{note.title}</div>
                <div className={styles.text}>{note.text}</div>
                <div className={styles.removeConnection} onClick={handleRemoveClick}/>
            </div>
        </div>
    );
}

export default EditorConnection;