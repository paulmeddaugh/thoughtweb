import { useAppContent } from '../context/appContent';
import { useUser } from '../context/user';
import styles from '../styles/Account.module.css';

const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('en-us', { month:"short", day:"numeric", year: "numeric"});
}

const Account = () => {
    const { user } = useUser();
    const { name, username, email, dateCreated } = user ?? {};
    const { graph, notebooks } = useAppContent();
    const noteCount = graph.size() ?? 0;
    const notebookCount = notebooks.length - 1;
    return (
        <div className={styles.main}>
            <form className={styles.info}>
                <div className={styles['row']}>
                    <b>Name</b>
                    <label>{name ?? '-'}</label>
                </div>
                <div className={styles['row']}>
                    <b>Username</b>
                    <label>{username}</label>
                </div>
                <div className={styles['row']}>
                    <b>Email</b>
                    <label>{email ?? '-'}</label>
                </div>
                <div className={styles['read-only-row']}>
                    <b>Date Created:&nbsp;</b>
                    <label>{formatDate(dateCreated)}</label>
                </div>
                <div className={styles['read-only-row']}>
                    <b>Notebook Count:&nbsp;</b>
                    <label>{notebookCount}</label>
                </div>
                <div className={styles['read-only-row']}>
                    <b>Notes Count:&nbsp;</b>
                    <label>{noteCount}</label>
                </div>
            </form>
        </div>
    )
}

export default Account;