import { useEffect, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { isDev } from '../../scripts/utility/utility';
import styles from '../../styles/LoginComponentStyles/Login.module.css'; // Import css modules stylesheet as styles

const Login = ({ usernameValue, passwordValue, onUsernameChange, onPasswordChange, onSubmit, onOAuth2Login }) => {

    const usernameRef = useRef(null);
    const passwordRef = useRef(null);

    const [searchParams] = useSearchParams();
    const oauth = searchParams.get('usingOauth');

    useEffect(() => {
        if (oauth) {
            onOAuth2Login?.();
        }
    }, [oauth, onOAuth2Login]);

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
            alert(error);
            focusRef.current.focus();
            e.preventDefault();
        } else {
            onSubmit(usernameValue, passwordValue);
        }
    }

    return (
        <div className={`${styles.flexCenter} ${styles.body}`}>
            <div className={styles.title}>thoughtweb</div>
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
                            className={`${styles.textAlignCenter} ${styles.inputs}`}
                            placeholder="Username"
                            ref={usernameRef}
                            value={usernameValue || ''}
                            onChange={onUsernameChange || null} 
                        />
                    </div>
                    <div className={styles.inputRow}>
                        <label className={styles.label + " " + styles.textAlignCenter}> 
                            &nbsp;Password:&nbsp; 
                        </label><br />
                        <input 
                            type="password" 
                            id="Password" 
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
                            value="Login"
                            onClick={validateForm}
                        />
                    </div>
                </form>
                <div className={styles.linksContainer}>
                    <div id={styles.oauthLinks}>
                        <div 
                            className={styles.oauthLinkContainer} 
                            onClick={(e) => window.location.href = `${isDev() ? 'http://localhost:8080' : ''}/oauth2/authorization/google`}
                        >
                            <div className={styles.googleIcon}></div>
                            <span className={styles.oauthButtonText}>Log In With Google</span>
                        </div>
                    </div>
                    <div>
                        <Link className={styles.link} to="createAccount">Create Account</Link>
                        <Link className={styles.link}  to="forgotPassword">Forgot Password</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;