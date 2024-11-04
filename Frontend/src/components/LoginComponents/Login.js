import styles from '../../styles/LoginComponentStyles/Login.module.css';
import { Link } from 'react-router-dom';
import Notification from '../global/Notification';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useLoading } from '../../context/loading';
import { invalidInputMessage } from '../../scripts/forms/validate';
import { getCurrentUserFromBackend, getGoogleAccessTokens, loginWithCredentials, setAxiosBearerToken } from '../../services/axios';
import { useUser } from '../../context/user';
import { useAuthTokens } from '../../context/authTokens';

const BASE_URL = `${window.location.protocol}//${window.location.host}`;
const GOOGLE_LOGIN_URL = `${BASE_URL}/api/login/google?returnUrl=/login`;

const queryParameters = new URLSearchParams(window.location.search)
const jwt = queryParameters.get("jwt");

const Login = ({ formState, formErrors, onFormStateChange }) => {
    const usernameRef = useRef(null);
    const passwordRef = useRef(null);
    const { setUser } = useUser();
    const { setAuthTokens } = useAuthTokens();
    const [notificationProps, setNotificationProps] = useState(null);
    const { setLoading } = useLoading();

    const loadUserData = useCallback(async () => {
        try {
            const user = (await getCurrentUserFromBackend()).data;
            setUser(user);
            setLoading(false);
        } catch (e) {
            setLoading({
                status: `Could not get account data: ${e}.`,
                linkText: 'Retry',
            });
        }
    }, [setLoading, setUser]);

    const handleSubmit = useCallback(async (e) => {
        const isInvalid = !Object.entries(formErrors).every(([key, value]) => !value);
        if (isInvalid) {
            const message = Object.values(formErrors)
                .filter(value => value)
                .join("\n");
            setNotificationProps({ type: 'error', text: message });
            return;
        }

        const { usn: username, pwd: password } = formState;
        setLoading({ status: 'Loading...', icon: 0 });

        // Get access tokens
        try {
            const authTokens = (await loginWithCredentials(username, password)).data;
            if (!authTokens) {
                throw new Error();
            }
            setAuthTokens(authTokens);
            setAxiosBearerToken(authTokens?.accessToken);
        } catch (err) {
            console.log(err);
            const { data, status } = err?.response ?? {};
            setLoading({
                status: data ? `${data?.message} | ${status}` : "Error logging in.",
                linkText: 'Retry',
            });
            return;
        }

        loadUserData();
    }, [formErrors, formState, setLoading, loadUserData, setAuthTokens])

    useEffect(() => {
        // FIRES TWICE
        if (jwt) {
            (async function () {
                setLoading({ status: 'Loading...', icon: 0 });

                // Get Google access tokens
                const authTokens = (await getGoogleAccessTokens(jwt)
                    .catch(e => {
                        setLoading({
                            status: `Could not verify Google log in: ${e}`,
                            linkText: "Retry"
                        });
                    })).data;
                console.log('authTokens', authTokens);
                if (!authTokens) {
                    setLoading({
                        status: `Could not verify Google log in.`,
                        linkText: "Retry"
                    });
                    return;
                }
                setAuthTokens(authTokens);
                setAxiosBearerToken(authTokens?.accessToken);

                loadUserData();
            })();
        }
    }, [loadUserData, setAuthTokens, setLoading, setUser]);

    return (
        <section 
            className={`${styles.body} ${styles.flexCenter}`} 
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
            <div>
                <div className={styles.ghostLinkContainer}></div>
                <form className={styles.form}>
                    <div id={styles.journal} />
                    <h2 className={styles.formTitle}> 
                        Belongs To:
                    </h2>
                    <div className={styles.inputRow}>
                        <input 
                            type="text" 
                            id="Username" 
                            name='usn'
                            className={styles.inputs}
                            placeholder="Email or Username"
                            ref={usernameRef}
                            value={formState?.usn}
                            onChange={onFormStateChange}
                            autoFocus={true}
                        />
                    </div>
                    <div className={styles.inputRow}>
                        <input 
                            type="password" 
                            id="Password" 
                            name='pwd'
                            className={styles.inputs}
                            placeholder="Password"
                            ref={passwordRef} 
                            value={formState?.pwd}
                            onChange={onFormStateChange}
                            onKeyDown={(e) => {if (e.key === 'Enter') handleSubmit(e)}}
                        />
                    </div>
                    <div className={styles.submitContainer}>
                        <input 
                            type="button" 
                            className="button"
                            id={styles.loginButton}
                            value="Log In"
                            onClick={handleSubmit}
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
                        <Link className={styles.link} to="/createAccount">Create Account</Link>
                        <Link className={styles.link}  to="/forgotPassword">Forgot Password?</Link>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Login;