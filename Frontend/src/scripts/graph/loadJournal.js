import Note from '../notes/note.js';
import Notebook from '../notes/notebook.js';
import Graph from './graph.js';
import { stringFromSQL } from '../utility/utility.js';
import { comparePositions, positionBefore } from '../utility/customOrderingAsStrings.js';
import { getJournalDataFromBack, updateOrderOnBack } from '../../axios/axios.js';

let NO_NOTES_ORDER_BEGIN = 'O';

/**
 * Loads a user's notes into a graph from the database.
 * 
 * @param {number} idUser The user whose notes to return.
 * @param {function} callback The function to call when the AJAX request returns.
 * @param {number} idNotebook An optional parameter to narrow the notes returned to a notebook.
 */
export default function loadJournal (idUser, callback, idNotebook, asDisplayableNotes) {

    if (!idUser) return;

    getJournalDataFromBack(idUser).then((response) => {
        let graph = new Graph(), notebooks = [], userOrder = [];

        const nbs = response.data._embedded.collectionModelList[0]._embedded?.notebookList;
        const notes = response.data._embedded.collectionModelList[1]._embedded?.noteList;
        const connections = response.data._embedded.collectionModelList[2]._embedded?.connectionList;

        // Loads user note data into the graph and order array
        if (notes) {
            for (let noteData of notes) {
                let note = new Note(noteData.id, stringFromSQL(noteData.title), 
                    stringFromSQL(noteData.text), stringFromSQL(noteData.quotes), noteData.idNotebook, 
                    !!Number(noteData.main), noteData.dateCreated, noteData?.allNotesPosition);

                graph.addVertex(note);
                userOrder.push({ id: note.id, graphIndex: graph.size() - 1, order: note?.allNotesPosition });
            }
        }
        userOrder.sort((s1, s2) => comparePositions(s2.order, s1.order));

        // Adds an order value to any notes without
        if (userOrder.length !== 0 && !userOrder[0]?.order) {
            let firstOrderIndex = userOrder.findIndex((val) => val.order);
            if (firstOrderIndex === -1) { // No order vals found
                updateOrder(firstOrderIndex = userOrder.length - 1, () => NO_NOTES_ORDER_BEGIN);
            }

            while (firstOrderIndex) {
                updateOrder(firstOrderIndex - 1, () => positionBefore(userOrder[firstOrderIndex--].order));
            }

            /**
             * Updates a note's 'allNotesPosition' property and userOrder 'order' property from the note's 
             * index in userOrder to whatever the orderValFunc parameter returns, updating both on front
             * and back ends.
             * 
             * @param {number} userOrderIndex The index of the note (pointed to by 'graphIndex') to update.
             * @param {function} orderFunc A function which returns the value to change the note's order to.
             */
            function updateOrder (userOrderIndex, orderValFunc) {
                const note = graph.getVertex(userOrder[userOrderIndex].graphIndex);

                // Updates on frontend
                userOrder[userOrderIndex].order = note.allNotesPosition = orderValFunc();
                graph.updateVertex(note);

                // Updates on backend
                updateOrderOnBack(note.id, note.allNotesPosition);
            }
        }

        // Loads note connections into graph
        if (connections) {
            for (let connection of connections) {
                graph.addEdge(graph.getVertex(String(connection.idNote1)), 
                    graph.getVertex(String(connection.idNote2)));
            }
        }

        // Loads notebook data into an array
        if (nbs) {
            for (let nbData of nbs) {
                let notebook = new Notebook(nbData.id, nbData.name);
                notebooks.push(notebook);
            }
        }

        callback?.(graph, notebooks, userOrder);
    });
}