import styles from '../../styles/LoginComponentStyles/ForgotPassword.module.css';
import TWForm from './TWForm';
import { useState } from 'react';
import { sendResetPasswordEmailRequest } from '../../services/axios';
import { invalidInputMessage } from '../../scripts/forms/validate';

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
    const onSubmit = async (values) => {
        const res = await sendResetPasswordEmailRequest(values.email);
        const notifType = !res.data.error ? 'success' : 'error';
        setNotification({ type: notifType, text: notifType === 'success' ? res.data.message : res.data.error });
    }
    return (
        <TWForm 
            renderTitle={() => (
                <h1 className={styles.pageTitle}>{"Forgot Password"}</h1>
            )}
            inputPropertiesArray={inputPropertiesArray}
            onSubmit={onSubmit}
            submitText={"Reset Password"}
            notificationProps={notification}
        >
            <div className={styles.resetInfo}>A link to reset your password will be sent to your email and remain active for 24 hours.</div>
        </TWForm>
    );
}

export default ForgotPassword;