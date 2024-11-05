import styles from '../../styles/LoginComponentStyles/TWForm.module.css';

// Components
import { Link } from 'react-router-dom';
import Notification from '../global/Notification';

// Hooks
import useForm from '../../hooks/useForm';
import { useMemo, useState } from 'react';

const LINK_ROUTES = [
    { text: 'Login', route: '/login' }, 
    { text: 'Forgot Password?', route: '/forgotPassword' }, 
    { text: 'Create Account', route: '/createAccount' }
];

const TWForm = ({ 
    title,
    renderTitle,
    inputPropertiesArray,
    onSubmit,
    submitText,
    notificationProps,
    onNotificationClose,
    linkRoutes = null, // excludes current path
    children
}) => {
    const [internalNotificationProps, setInternalNotificationProps] = useState(null);
    const [initialValues, validators] = useMemo(() => {
        return inputPropertiesArray.reduce((carry, { name, label, initialValue, validator }) => {
            carry[0][name] = initialValue;
            carry[1][name] = validator;
            return carry;
        }, [{}, {}])
    }, [inputPropertiesArray]);
    const { formState, formErrors, touched, onFormInputChange, onFormInputBlur, touchAll } = useForm(
        initialValues,
        validators
    );
    const onFormSubmit = () => {
        touchAll();
        const isValid = Object.entries(formErrors).every(([key, value]) => !value);
        if (!isValid) {
            const message = Object.values(formErrors)
                .filter(value => value)
                .join("\n");
            setInternalNotificationProps({ type: 'error', text: message });
            return false;
        }

        onSubmit?.(formState);
    }

    const handleNotificationClose = () => {
        setInternalNotificationProps(null);
        onNotificationClose?.();
    }

    const onPasswordChange = (e) => {
        const changeResult = onFormInputChange(e);
        if (formState?.repwd) {
            onFormInputChange({ target: { name: 'repwd', value: formState.repwd } })
        }
        return changeResult;
    }

    return (
        <div className={styles.body}>
            {(!!internalNotificationProps || !!notificationProps ) && (
                <Notification 
                    type={notificationProps?.type || internalNotificationProps?.type} 
                    text={notificationProps?.text || internalNotificationProps?.text}
                    onClose={handleNotificationClose}
                />
            )}
            <div className={styles.content}>
                <form className={styles.form}>
                    {!renderTitle ? (
                        <h1 className={styles.pageTitle}>{title ?? "Title"}</h1>
                    ) : 
                        renderTitle?.()
                    }
                    {inputPropertiesArray.map(({ name, label, description }) => (
                        <InputRow
                            label={`${label}:`}
                            name={name}
                            description={description}
                            error={formErrors[name]}
                            showError={touched[name]}
                            onChange={name !== 'pwd' ? onFormInputChange : onPasswordChange}
                            onBlur={onFormInputBlur}
                            key={name}
                        />
                    ))}
                    {children}
                    <input 
                        type="button" 
                        className={`${styles.submit}`}
                        name="Enter" 
                        value={submitText ?? 'Submit'}
                        onClick={onFormSubmit}
                    />
                </form>
                {LINK_ROUTES
                    .filter((routeProps => !linkRoutes
                        ? window.location.pathname !== routeProps.route
                        : linkRoutes.includes(routeProps.route)))
                    .map(routeProps => (
                        <Link className={styles.link} to={routeProps.route} key={routeProps.route}>
                            {routeProps.text}
                        </Link>
                    ))}
            </div>
        </div>
    )
}

function InputRow ({ label, name, description, error, showError, onChange, onBlur }) {
    const isError = error && showError;
    return (
        <div className={styles.inputField}>
            <div className={styles.inputRow}>
                <label 
                    className={styles.label + (isError ? " " + styles.labelRed : '')} 
                    htmlFor={name}
                >
                    {label}
                </label>
                <input
                    type={(name !== 'pwd' && name !== 'repwd') ? 'text' : 'password'}
                    name={name} 
                    className={`flex1 ${styles.input} ${isError ? styles.inputRed : ''}`}
                    id={name}
                    size="30" 
                    onChange={onChange}
                    onBlur={onBlur}
                />
            </div>
            {!!description && (
                <>
                    <div className={styles.descriptionIcon}></div>
                    <div className={styles.description}>{description}</div>
                </>
            )}
        </div>
    )
}

export default TWForm;