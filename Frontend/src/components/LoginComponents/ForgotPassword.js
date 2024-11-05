import styles from '../../styles/LoginComponentStyles/ForgotPassword.module.css';
import TWForm from './TWForm';
import { useState } from 'react';
import { sendResetPasswordEmailRequest } from '../../services/axios';
import { invalidInputMessage } from '../../scripts/forms/validate';

const EMAIL_REDIRECT_PATH = '/changePassword?animation=false';

const inputPropertiesArray = [
    {
        name: "email",
        label: "Email",
        validator: invalidInputMessage.email,
        initialValue: "",
    }
]

const ForgotPassword = () => {
    const [notification, setNotification] = useState(null);
    const handleSubmit = async (values) => {
        let res = null;
        try {
            res = await sendResetPasswordEmailRequest(values.email, EMAIL_REDIRECT_PATH);
        } catch (e) {
            res = e;
        } finally {
            const notifType = !res.data?.message ? 'success' : 'error';
            setNotification({ type: notifType, text: notifType === 'success' ? res.data : res.data?.message });
        }
    }
    const handleNotificationClose = () => {
        setNotification(null);
    }
    return (
        <TWForm 
            renderTitle={() => (
                <h1 className={styles.pageTitle}>{"Forgot Password"}</h1>
            )}
            inputPropertiesArray={inputPropertiesArray}
            onSubmit={handleSubmit}
            submitText={"Reset Password"}
            notificationProps={notification}
            onNotificationClose={handleNotificationClose}
        >
            <div className={styles.resetInfo}>A link to reset your password will be sent to your email and remain active for 24 hours.</div>
        </TWForm>
    );
}

export default ForgotPassword;