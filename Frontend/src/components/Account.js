import styles from '../styles/Account.module.css';

const Account = ({ name, username, email, dateCreated, noteCount, notebookCount }) => {

    dateCreated = new Date(dateCreated)?.toLocaleDateString('en-us', { month:"short", day:"numeric", year: "numeric"});

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
                    <label>{dateCreated}</label>
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