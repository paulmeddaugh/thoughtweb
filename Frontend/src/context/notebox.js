import { createContext, useContext, useState } from "react";

const NoteboxContext = createContext(null);

export const NoteboxProvider = ({ children }) => {
    const [isPinned, setPinned] = useState(true);
    return (
        <NoteboxContext.Provider value={{ isPinned, setPinned }}>
            {children}
        </NoteboxContext.Provider>
    )
}

export function useNotebox() {
    return useContext(NoteboxContext);
}