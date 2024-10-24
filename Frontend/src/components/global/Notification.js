import styles from '../../styles/global/Notification.module.css';

const Notification = ({ type, className = '', onClose, text, ...props }) => {
    return (
        <div {...props} className={`${className} ${styles.container} ${styles[type]}`}>
            <div className={styles.textContainer}>
                {text && text?.split("\n").map(line => (
                    <div className={styles.text} key={line}>{line}</div>
                ))}
            </div>
            <span className={styles.close} onClick={onClose}></span>
        </div>
    );
}

export default Notification;