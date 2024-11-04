import styles from '../../styles/LoginComponentStyles/CreateAccount.module.css'; // Import css modules stylesheet as styles
import TWForm from './TWForm';
import { useState } from 'react';
import { createNewUserOnBack } from '../../services/axios';
import { invalidInputMessage } from '../../scripts/forms/validate';

const INPUT_META = {
    name: { label: "Name" },
    usn: { label: "Username" },
    email: { label: "Email" },
    pwd: { label: "Password", description: "Must contain an uppercase letter and be at least 8 characters long." },
    repwd: { label: "Confirm password" },
    reminder: { label: "Reminder" },
}

const inputPropertiesArray = Object
    .entries(invalidInputMessage)
    .map(([name, validator]) =>
        ({
            name,
            label: INPUT_META[name]?.label,
            description: INPUT_META[name]?.description,
            validator,
            initialValue: "",
        })
    );

const CreateAccount = () => {
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
            if (response.status === 200) {
                setNotification({ type: 'success', text: "Successfully created!" });
            }
        }).catch((error) => {
            if (String(error?.response?.data).startsWith('Proxy error')) {
                alert('The backend is not running.');
            } else if (error?.response?.status === 403) {
                alert(error?.response?.data);
            } else {
                // ASP.NET error handling
                const data = error?.response?.data;
                const text = (data ? Object.values(data).flat().join('\n') : error?.message);
                setNotification({ type: 'error', text });
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