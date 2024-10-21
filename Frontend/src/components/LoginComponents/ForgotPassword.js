import styles from '../../styles/LoginComponentStyles/ForgotPassword.module.css';
import { Link } from 'react-router-dom';
import { useRef, useState } from 'react';
import { sendResetPasswordEmailRequest } from '../../axios/axios';
import { invalidInputMessage } from '../../scripts/forms/validate';
import Notification from '../global/Notification';

const ForgotPassword = () => {

    const [username, setUsername] = useState('');
    const [notification, setNotification] = useState(null);

    const usernameRef = useRef(null);

    const validateForm = async (e) => {

        e.preventDefault();
        
        if (!invalidInputMessage['usn'](username)) {
            alert("Please enter your username.");
            usernameRef.current.focus();
            return;
        }

        const res = await sendResetPasswordEmailRequest(username);
        const notifType = !res.data.error ? 'success' : 'error';
        setNotification({ type: notifType, text: notifType === 'success' ? res.data.message : res.data.error });
    }

    return (
        <div className={styles.body}>
            <main className={styles.content}>
                <h2 className={styles.pageTitle}> Forgot Password </h2>
                <form onSubmit={validateForm}>

                    <div className={styles.inputRow}>
                        <label htmlFor="usn">Username:&nbsp;</label>
                        <input 
                            type="text" 
                            id="usn" 
                            name="username" 
                            value={username}
                            ref={usernameRef}
                            onChange={(e) => setUsername(e.target.value)}
                            //onblur="chkUSN()" 
                            size="30" 
                        />
                    </div>
                    <div>A reset password link will be sent to your email and remain active for 24 hours.</div>
                    {notification && <Notification type={notification.type} className={styles.notification} onClose={() => setNotification(null)}>
                        {notification.text}
                    </Notification>}
                    <input 
                        id={styles.submit}
                        type="submit" 
                        className='button'
                        name="Enter" 
                        value="Reset Password"
                    />
                </form>
                <br/>
                <Link className={styles.link} to="/">Login</Link>&nbsp;
                <Link className={styles.link} to="/createAccount">Create Account</Link>
            </main>
        </div>
    )
}

export default ForgotPassword;