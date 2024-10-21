import styles from '../../styles/global/Notification.module.css';

const Notification = ({ type, className, onClose, children, ...props }) => {

    return (
        <div {...props} className={`${className} ${styles.container} ${styles[type]}`}>
            <span className={styles.text}>{children}</span>
            <span className={styles.close} onClick={onClose}></span>
        </div>
    );
}

export default Notification;