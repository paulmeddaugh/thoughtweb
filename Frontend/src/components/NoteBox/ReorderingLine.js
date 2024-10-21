import styles from '../../styles/NoteBox/ReorderingLine.module.css';

const ReorderingLine = ({ absoluteCoordinates }) => {
    return (
        <div id={styles.line} style={{ left: (absoluteCoordinates?.left ?? 0), top: (absoluteCoordinates?.top ?? 0)}}></div>
    )
}

export default ReorderingLine;