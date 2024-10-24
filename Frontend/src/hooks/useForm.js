import { useRef, useState } from "react"
import { fillObjectWithValues } from "../scripts/utility/utility";

/**
 * 
 * @param {*} initialState An object with keys that are names of the inputs and values of their initial state.
 * @param {*} stateValidators An object with keys that are names of the inputs and values which are validator functions.
 * @returns 
 */
export default function useForm (initialState, stateValidators) {
    const [formState, setFormState] = useState(initialState);
    const formValidators = useRef(stateValidators).current;
    const [formErrors, setFormErrors] = useState( // fill with errors initially
        fillObjectWithValues(initialState, (key) => stateValidators[key]?.(initialState[key]))
    );
    const [touched, setTouched] = useState(fillObjectWithValues(initialState, () => false));
    const onFormInputChange = (e) => {
        const { name, value, } = e.target;
        setFormErrors(prev => ({ ...prev, [name]: formValidators[name](value, formState) }));
        setFormState(prev => ({ ...prev, [name]: value }));
    };
    const onFormInputBlur = (e) => {
        const { name } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
    }
    const touchAll = () => {
        setTouched(fillObjectWithValues(initialState, true));
    }

    return { formState, formErrors, touched, onFormInputChange, onFormInputBlur, touchAll };
}