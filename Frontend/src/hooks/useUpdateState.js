import { useState } from "react";

/**
 * Customizes the React useState() hook to only require properties to be updated in an object state as
 * the parameters in the returned seting state function. 
 * 
 * @param {*} initState The value to initialize the state to.
 * @returns An array with the state variable as the first index and a function for updating the state
 * as the second index.
 */
export default function useUpdateState (initState) {
    const [ state, setState ] = useState(initState)
    
    const setMergeState = (value) => {
      setState((prevValue) => {
        const newValue = typeof value === 'function' ? value(prevValue) : value
        return newValue ? { ...prevValue, ...newValue } : prevValue
      })
    }
    
    return [ state, setMergeState ];
};