import { binarySearch, binaryInsert } from './utility.js';

describe("Binary methods", () => {
    test("Binary search testing for a notebook name from its 'id", () => {
        const arr = [
            { id: 1, name: 'You\'re Lie In April' },
            { id: 2, name: 'Pirates of the Carribbean' },
            { id: 3, name: 'Violet Evergarden' },
            { id: 5, name: 'Stevey Wonder' },
            { id: 8, name: 'Medal of Honor' },
        ];

        expect(JSON.stringify(binarySearch(arr, 2))).toBe(JSON.stringify([arr[1], 1]));
        expect(JSON.stringify(binarySearch(arr, 3))).toBe(JSON.stringify([arr[2], 2]));
        expect(JSON.stringify(binarySearch(arr, 5))).toBe(JSON.stringify([arr[3], 3]));
        expect(JSON.stringify(binarySearch(arr, 8))).toBe(JSON.stringify([arr[4], 4]));
    });

    test("Binary inserts an object with an 'id' into the connections array", () => {
        const arr = [
            { v: { id: 2 } },
        ];
        expect(JSON.stringify(binaryInsert(arr, { id: 1 }))).toBe("[{\"v\":{\"id\":1}},{\"v\":{\"id\":2}}]");
    });
})