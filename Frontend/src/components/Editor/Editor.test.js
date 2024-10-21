import Graph from '../scripts/graph/graph';
import { getConnectingNote } from './EditNote.js';

describe("Unit tests for the EditNote component", () => {
    test("Returns the correct note from its id in O(log) or O(m)", () => {

        const graph = new Graph([{ id: 1}, { id: 2}, { id: 3}]);

        const getConnectingNote = (id) => { // O(log n) or O(m)

            let note = false;
    
            if (id <= graph.getVertex(initialGraphSize - 1)?.id) {
                // Binary searches for the note: O(log initial-n)
                let vertices = graph.getVertices();
                vertices.length = initialGraphSize;
                note = binarySearch(vertices, id)[0];
            } else if (id < 0) {
                // Determines note index: O(1) if negative (an unsaved new note)
                note = graph.getVertex(initialGraphSize - 1 + Math.abs(id));
            } else {
                // Note is newly created and searches within new note indices: O(m)
                for (let i = initialGraphSize, size = graph.size(); i < size; i++) {
                    const n = graph.getVertex(i);
                    if (n.id === id) {
                        note = n;
                    }
                }
            }
    
            return (note !== false && note !== []) ? note : null;
        }
    })
})