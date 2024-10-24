import styles from '../../styles/LoginComponentStyles/CreateAccount.module.css'; // Import css modules stylesheet as styles
import { Link, useNavigate } from 'react-router-dom';
import { createNewUserOnBack } from '../../axios/axios';
import { invalidInputMessage } from '../../scripts/forms/validate';
import useForm from '../../hooks/useForm';
import TWForm from './TWForm';
import { useState } from 'react';

const LABELS = {
    name: "Name",
    usn: "Username",
    email: "Email",
    pwd: "Password",
    repwd: "Confirm password",
    reminder: "Reminder",
}

const inputPropertiesArray = Object
    .entries(invalidInputMessage)
    .map(([name, validator]) =>
        ({
            name,
            label: LABELS[name],
            validator,
            initialValue: "",
        })
    );

const CreateAccount = () => {
    const navigate = useNavigate();
    const [notification, setNotification] = useState(null);
    const onSubmit = (values) => {
        const newUser = {
            email: values['email'],
            username: values['usn'],
            password: values['pwd'],
            reminder: values['reminder'],
            name: values['name']
        };
        console.log('newUser', newUser);
        createNewUserOnBack(newUser).then((response) => {
            if (response.status === 201) {
                alert("Successfully created!");
                navigate('/');
            }
        }).catch((error) => {
            if (String(error?.response?.data).startsWith('Proxy error')) {
                alert('The backend is not running.');
            } else if (error?.response?.status === 403) {
                alert(error?.response?.data);
            } else {
                setNotification({ notifType: 'error', message: error });
                console.log(error);
            }
        });
    }

    return (
        <TWForm 
            title={"Create Account"}
            inputPropertiesArray={inputPropertiesArray}
            onSubmit={onSubmit}
            submitText={"Create"}
            notificationProps={notification}
        />
    )
}

export default CreateAccount;