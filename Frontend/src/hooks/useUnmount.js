import { useRef, useEffect } from "react";

/**
 * A custom React hook that utilizes the useEffect return callback, but attaches a ref to the 
 * function to not have stale state values when the callback is invoked.
 * 
 * @param {function} callback A function to invoke when dependencies are unmounted.
 * @param {Array} dependecies The array for dependencies that trigger the hook, though not the 
 * only values that are not stale.
 */
export const useUnmount = (callback, dependecies = []) => {
    const callbackRef = useRef(callback);
    callbackRef.current = callback;
    
    useEffect(() => {
        return () => {
            callbackRef.current()
        }
    }, dependecies);
}