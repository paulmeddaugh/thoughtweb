import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import styles from '../../styles/LoginComponentStyles/Login.module.css';
import Notification from '../global/Notification';
import { invalidInputMessage } from '../../scripts/forms/validate';

const BASE_URL = `${window.location.protocol}//${window.location.host}`;
const GOOGLE_LOGIN_URL = `${BASE_URL}/api/login/google`;

const Login = ({ usernameValue, passwordValue, onUsernameChange, onPasswordChange, onSubmit, onOAuth2Login }) => {
    const usernameRef = useRef(null);
    const passwordRef = useRef(null);
    const [notificationProps, setNotificationProps] = useState(null);

    const validateForm = async (e) => {
        
        // Builds error message if error
        let error = null, focusRef = null;
        if (usernameValue === "") {
            error = "Please enter your username.";
            focusRef = usernameRef;
        }
        if (passwordValue === "") {
            error = (error) ? 
                error.substring(0, error.length - 1) + " and password." : "Please enter your password.";
            if (!focusRef) focusRef = passwordRef;
        }

        if (error) {
            setNotificationProps({ type: 'error', text: error });
            focusRef.current.focus();
            e.preventDefault();
            return;
        }

        const isEmail = !invalidInputMessage.email(usernameValue);
        onSubmit(usernameValue, passwordValue, isEmail);
    }

    return (
        <section 
            className={`${styles.flexCenter} ${styles.body}`} 
            // style={{ background: `radial-gradient(${BACKGROUND_BLUE} 50%, ${DARK_BACKGROUND_BLUE})` }}
        >
            {!!notificationProps && (
                <Notification 
                    type={notificationProps?.type} 
                    text={notificationProps?.text}
                    onClose={() => setNotificationProps(null)}
                />
            )}
            <h1 className={styles.title}>thoughtweb</h1>
            <div id={styles.journal} />
            <div>
                <form className={styles.form}>
                    <div className={styles.inputRow}>
                        <label className={styles.label + " " + styles.textAlignCenter}> 
                            &nbsp;Journal Belongs To:&nbsp; 
                        </label><br />
                        <input 
                            type="text" 
                            id="Username" 
                            name='usn'
                            className={`${styles.textAlignCenter} ${styles.inputs}`}
                            placeholder="Username or Email"
                            ref={usernameRef}
                            value={usernameValue || ''}
                            onChange={onUsernameChange || null} 
                            autoFocus={true}
                        />
                    </div>
                    <div className={styles.inputRow}>
                        <label className={styles.label + " " + styles.textAlignCenter}> 
                            &nbsp;Password:&nbsp; 
                        </label><br />
                        <input 
                            type="password" 
                            id="Password" 
                            name='pwd'
                            className={`${styles.textAlignCenter} ${styles.inputs}`}
                            placeholder="Password"
                            ref={passwordRef} 
                            value={passwordValue || ''}
                            onChange={onPasswordChange || null}
                            onKeyDown={(e) => {if (e.key === 'Enter') validateForm(e)}}
                        />
                    </div>
                    <div className={styles.submitContainer}>
                        <input 
                            type="button" 
                            className="button"
                            id="login" 
                            value="Log In"
                            onClick={validateForm}
                        />
                    </div>
                </form>
                <div className={styles.linksContainer}>
                    <div id={styles.oauthLinks}>
                        <a 
                            className={styles.oauthLinkContainer} 
                            href={GOOGLE_LOGIN_URL}
                        >
                            <div className={styles.googleIcon}></div>
                            <span className={styles.oauthLinkText}>Log In With Google</span>
                        </a>
                    </div>
                    <div>
                        <Link className={styles.link} to="createAccount">Create Account</Link>
                        <Link className={styles.link}  to="forgotPassword">Forgot Password?</Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Login;