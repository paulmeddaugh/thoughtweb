import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useNoteGraph } from "./noteGraph";
import { comparePositions, positionAfter, positionBefore, positionBetween } from "../scripts/utility/customOrderingAsStrings";
import { useSelected } from "./selected";
import { useNotebooks } from "./notebooks";

const NoteOrderContext = createContext(null);

export const NoteOrderProvider = ({ children }) => {
    const [noteOrder, setNoteOrder] = useState({ allNotebooks: {} });
    const { notebookId } = useSelected().selected;
    const { graph, updateNote } = useNoteGraph();
    const { updateNotebookOrder } = useNotebooks();

    const notebookKey = useMemo(() => {
        return notebookId ?? 'allNotebooks';
    }, [notebookId]);

    const getNoteOrder = useCallback((noteId) => {
        if (noteId.id) {
            noteId = noteId.id;
        }
        return String(noteOrder[notebookKey]?.[noteId] ?? noteId);
    }, [notebookKey, noteOrder]);

    const orderedNotes = useMemo(() => {
        const ordered = graph?.getVertices()
            ?.sort((n1, n2) => 
                comparePositions(getNoteOrder(n2.id), getNoteOrder(n1.id))
            );
        return !notebookId
            ? ordered
            : ordered.filter(note => notebookId === note.idNotebook);
    }, [getNoteOrder, graph, notebookId])

    const setAllNotebooksOrder = (orders) => {
        setNoteOrder(prev => ({ ...prev, allNotebooks: orders }));
    }

    const updateNoteOrderAt = useCallback(async (note, index) => {
        const generatedPosition = (() => {
            switch (index) {
                case 0:
                    const firstOrder = getNoteOrder(orderedNotes[0].id);
                    return positionBefore(firstOrder);
                case orderedNotes.length:
                    const lastOrder = getNoteOrder(orderedNotes[orderedNotes.length - 1].id);
                    return positionAfter(lastOrder);
                default:
                    const o1 = getNoteOrder(orderedNotes[index - 1]), 
                          o2 = getNoteOrder(orderedNotes[index]);
                    return positionBetween(o1, o2);
            }
        })();
        setNoteOrder(prev => ({ 
            ...prev, 
            [notebookKey]: { 
                ...prev[notebookKey], 
                [note.id]: generatedPosition 
            } 
        }))
        if (notebookKey === 'allNotebooks') {
            note.allNotesPosition = generatedPosition;
            await updateNote(note);
        } else {
            await updateNotebookOrder(notebookKey, note.id, generatedPosition);
        }
    }, [getNoteOrder, notebookKey, orderedNotes, updateNote, updateNotebookOrder]);

    const removeNoteOrder = useCallback((noteId) => {
        setNoteOrder(({ [notebookKey]: notebookOrder, ...remainingNotebooks }) => {
            const { [noteId]: _, ...remainingNotes } = notebookOrder;
            return ({ ...remainingNotebooks, [notebookKey]: remainingNotes });
        });
    }, [notebookKey])

    const removeNoteOrdersOfNotebook = useCallback((notebookId) => {
        setNoteOrder(({ [notebookId]: _, ...remainingNotebooks }) => {
            // Doesn't currently remove notes from 'allNotebooks' property
            // for (let note of orderedNotes) {
            //     if (note.idNotebook === notebookId) {
            //         delete newNoteOrder[note.id];
            //     }
            // }
            return remainingNotebooks;
        })
    }, [])

    return (
        <NoteOrderContext.Provider value={{ 
            noteOrder, 
            orderedNotes, 
            getNoteOrder, 
            updateNoteOrderAt, 
            removeNoteOrder, 
            removeNoteOrdersOfNotebook, 
            setNoteOrder,
            setAllNotebooksOrder,
        }}>
            {children}
        </NoteOrderContext.Provider>
    );
}

export const useNoteOrder = () => useContext(NoteOrderContext);