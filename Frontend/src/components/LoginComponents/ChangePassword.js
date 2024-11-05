import styles from '../../styles/LoginComponentStyles/ChangePassword.module.css';
import { useSearchParams } from 'react-router-dom';
import { useState } from 'react';
import { updatePassword } from '../../services/axios';
import { invalidInputMessage } from '../../scripts/forms/validate';
import TWForm from './TWForm';

const inputPropertiesArray = [
    {
        name: "pwd",
        label: "New Password",
        description: "Must contain an uppercase letter and be at least 8 characters long.",
        validator: invalidInputMessage.pwd,
        initialValue: "",
    }
]

const UpdatePassword = () => {
    const [notification, setNotification] = useState(null);
    const [searchParams] = useSearchParams();
    const handleSubmit = async (values) => {
        let res = null;
        try {
            const token = searchParams.get('token');
            res = await updatePassword(token, values.pwd);
        } catch (e) {
            res = e;
        } finally {
            const type = !res.data?.message ? 'success' : 'error';
            setNotification({ type, text: type === 'success' ? res.data : res.data?.message });
        }
    }
    const handleNotificationClose = () => {
        setNotification(null);
    }
    return (
        <TWForm 
            renderTitle={() => (
                <h1 className={styles.pageTitle}>{"Change Password"}</h1>
            )}
            inputPropertiesArray={inputPropertiesArray}
            onSubmit={handleSubmit}
            submitText={"Update Password"}
            notificationProps={notification}
            onNotificationClose={handleNotificationClose}
            linkRoutes={['/login', '/createAccount']}
        />
    );
}

export default UpdatePassword;