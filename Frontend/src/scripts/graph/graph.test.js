import Graph from './graph.js';

describe("Graph tests", () => {
    test("it should remove a vertex and clone the changed graph", () => {

        const input = [
            { id: 1, url: "https://www.url1.dev" },
            { id: 2, url: "https://www.url2.dev" },
            { id: 3, url: "https://www.link3.dev" },
            { id: 4, url: "https://www.link4.dev" },
        ];

        const g = new Graph(input, [[0, 1], [0, 2]]);
  
        g.removeVertex(3);
        const gClone = g.clone();

        expect(JSON.stringify(gClone.getVertices())).toBe(JSON.stringify(g.getVertices()));
        expect(JSON.stringify(gClone.getNeighbors())).toBe(JSON.stringify(g.getNeighbors()));
    });
    // test("it should update a vertex in the graph", () => {

    // })
    test("binary list remove function testing", () => {
        const arr = [{id: 3}, {id: 5}, {id: 8}, {id: 9}, {id: 11}, {id: 15}];
        const toBe = arr.concat();
        const binaryDelete = (arr, v) => {
            let low = 0, high = arr.length - 1, mid = 0|(low + (high - low) / 2);
            while (high >= low) { // greater than mid
                if (v.id > arr[mid].id) {
                    low = mid + 1;
                    mid = 0|(low + (high - low) / 2);
                } else if (v.id < arr[mid].id) { // less than mid
                    high = mid - 1;
                    mid = 0|(low + (high - low) / 2);
                } else { // found
                    high = low - 1;
                    arr.splice(mid, 1);
                }
            }

            return arr;
        }
        toBe.splice(4, 1);
        expect(JSON.stringify(binaryDelete(arr, {id: 11}))).toBe(JSON.stringify(toBe));
    });
});