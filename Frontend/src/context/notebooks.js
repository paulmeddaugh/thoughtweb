import { createContext, useCallback, useContext, useState } from "react";
import { createNotebookOnBack, deleteNotebookOnBack, updateNotebookOnBack } from "../services/axios";
import { useUser } from "./user";
import Notebook from "../scripts/notes/notebook";
import { useNoteGraph } from "./noteGraph";
import { binarySearch } from "../scripts/utility/utility";

const NotebooksContext = createContext(null);

export const NotebooksProvider = ({ children }) => {
    const [notebooks, setNotebooks] = useState([]);
    const { deleteNotesOfNotebook } = useNoteGraph();
    const { userId } = useUser();

    const createNotebook = useCallback(async (name) => {
        const notebookDTO = Notebook.creationRequestDTO(name, userId),
              createResponse = await createNotebookOnBack(notebookDTO);
        const notebook = Notebook.fromCreationResponse(createResponse),
              updatedNotebooks = notebooks.concat();
        updatedNotebooks.push(notebook);
        setNotebooks(updatedNotebooks);
        return notebook;
    }, [notebooks, userId]);

    const getNotebookName = (id) => {
        if (typeof id !== 'number' || id === 0) return null;
        const nbName = binarySearch(notebooks, id)[0]?.name;
        return nbName ? nbName : null;
    }

    const findNotebookIndex = useCallback(id => {
        // O(log n): not sure if it's actually faster
        // const [notebook, index] = binarySearch(notebooks, notebookId, 0);
        // return index;
    
        // O(n)
        return notebooks.findIndex(n => n.id === id);
    }, [notebooks]);

    const updateNotebook = useCallback(async (newNotebook) => {
        const updateIndex = findNotebookIndex(notebooks, newNotebook.id);
        await updateNotebookOnBack(newNotebook);
        setNotebooks(prev => prev.map((nb, i) => updateIndex !== i ? nb : newNotebook));
    }, [findNotebookIndex, notebooks])

    const updateNotebookOrder = useCallback(async (notebookId, noteId, position) => {
        const notebook = notebooks[findNotebookIndex(notebooks, notebookId)];
        notebook.noteOrder[noteId] = position;
        await updateNotebookOnBack(notebook);
        setNotebooks(prev => prev.map(nb => notebookId !== nb.id ? nb : notebook));
    }, [findNotebookIndex, notebooks]);

    const deleteNotebook = useCallback(async (notebookId) => {
        await deleteNotebookOnBack(notebookId);
        deleteNotesOfNotebook(notebookId);
        setNotebooks(prev => prev.filter(n => n.id !== notebookId));
    }, [deleteNotesOfNotebook])

    return (
        <NotebooksContext.Provider value={{ 
            notebooks,
            setNotebooks,
            createNotebook,
            getNotebookName,
            findNotebookIndex,
            updateNotebook,
            updateNotebookOrder,
            deleteNotebook,
        }}>
            {children}
        </NotebooksContext.Provider>
    );
}

export function useNotebooks() {
    return useContext(NotebooksContext);
}