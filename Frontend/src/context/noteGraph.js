import { createContext, useCallback, useContext, useState } from "react";
import { useUser } from "./user";
import { addMultipleConnsOnBack, createNoteOnBack, deleteMultipleConnsOnBack, deleteNoteOnBack, updateNoteOnBack } from "../services/axios";
import Note from "../scripts/notes/note";

const NoteGraphContext = createContext(null);

export const NoteGraphProvider = ({ children }) => {
    const [graph, setGraph] = useState(null);
    const { userId } = useUser();

    const addFrontendNote = useCallback((point) => {
        const newNote = new Note(-1, '', '', '', null, true, new Date(), "", point);
        setGraph(prev => {
            const newGraph = prev.clone();
            newGraph.addVertex(newNote);
            return newGraph;
        });
        return newNote;
    }, [])

    /**
     * After creating a note with with addFrontendNote helper function to the frontend only, this 
     * submits the note to the backend and replaces the frontend note with the one received from
     * the backend.
     */
    const addNote = useCallback(async negativeIdNote => {
        const noteDTO = Note.toUpdateDTO(negativeIdNote, userId);
        const response = await createNoteOnBack(noteDTO);
        const newNote = { ...negativeIdNote, id: response.data.id };
        setGraph(prev => {
            const newGraph = prev.clone();
            newGraph.updateVertex(newNote, newGraph.size() - 1);    
            newGraph.print();
            return newGraph;
        })
        return newNote;
    }, [userId])

    const updateNote = useCallback(async (note) => {
        graph.updateVertex(note);
        setGraph(graph.clone());
        await updateNoteOnBack(Note.toUpdateDTO(note, userId));
    }, [graph, userId]);

    const deleteNote = useCallback((noteId) => {
        // Delete from backend
        if (noteId >= 0) {
            deleteNoteOnBack(noteId);
        }
        // Delete on frontend: O(1), O(n)
        graph.removeVertex({ id: noteId });
        setGraph(graph.clone());
    }, [graph])
    const deleteNotesOfNotebook = useCallback((notebookId) => {
        for (let note of graph.getVertices()) {
            if (note.idNotebook === notebookId) {
                graph.removeVertex(note);
            }
        }
        setGraph(graph.clone());
    }, [graph]);
    const addConnectionsToNote = useCallback(async (note, connections) => {
        const newGraph = graph.clone();
        const currentConnectionIds = new Set([ 
            note.id, 
            ...newGraph.getVertexNeighbors(note).map(conn => conn.v.id) 
        ]);
        const connectionIds = connections
            .map(conn => conn.v.id)
            .filter(connId => !currentConnectionIds.has(connId));

        await addMultipleConnsOnBack(userId, note.id, connectionIds);
        for (let id of connectionIds) { 
            newGraph.addEdge(note, { id });
        }
        setGraph(newGraph);
    }, [graph, userId])
    const updateConnectionsOfNote = async (noteId, newConns, removeConns) => {
        // Local state
        setGraph(graph => {
            const newGraph = graph.clone();
            console.log('updating conns', newConns, removeConns)
            for (let newConn of newConns) { // Adds new connections
                newGraph.addEdge({ id: noteId }, { id: newConn });
            }
            for (let removeConn of removeConns) { // Deletes connections
                newGraph.removeEdge({ id: noteId }, { id: removeConn });
            }
            newGraph.print();
            return newGraph;
        })

        // Backend
        if (newConns.length !== 0) {
            await addMultipleConnsOnBack(userId, noteId, newConns);
        }
        if (removeConns.length !== 0) {
            await deleteMultipleConnsOnBack(userId, noteId, removeConns);
        }
	}
    return (
        <NoteGraphContext.Provider value={{ 
            graph, 
            addFrontendNote,
            addNote, 
            updateNote, 
            deleteNote, 
            deleteNotesOfNotebook, 
            addConnectionsToNote, 
            updateConnectionsOfNote, 
            setGraph 
        }}>
            {children}
        </NoteGraphContext.Provider>
    );
}

export const useNoteGraph = () => useContext(NoteGraphContext);