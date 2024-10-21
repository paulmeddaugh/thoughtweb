import {
    FC,
    ReactNode,
    createContext,
    useContext,
    useState,
    useReducer
} from "react";

const _Map = () => new Map();
const Context = createContext(_Map());

export const Provider = ({ children }) =>
    <Context.Provider value={_Map()}>{children}</Context.Provider>;

const useContextProvider = (key) => {
    const map = useContext(Context);
    return {
        set value(v) { map.set(key, v); },
        get value() {
            if (!map.has(key)) {
                throw Error(`Context key '${key}' not found!`);
            }
            return map.get(key);
        }
    }
};

export const useProvider = (key, initialValue) => {
    const provider = useContextProvider(key);
    if (initialValue !== undefined) {
        const Context = createContext(initialValue);
        provider.value = Context;
    }
    return useContext(provider.value);
};

export const useSharedState = (key, initialValue) => {
    let state = undefined;
    if (initialValue !== undefined) {
        const _useState = useState;
        state = _useState(initialValue);
    }
    return useProvider(key, state);
};

export const useSharedReducer = (key, reducer, initialValue) => {
    let reducerState = undefined;
    if (initialValue !== undefined) {
        const _useReducer = useReducer;
        reducerState = _useReducer(reducer, initialValue);
    }
    return useProvider(key, reducerState);
};
