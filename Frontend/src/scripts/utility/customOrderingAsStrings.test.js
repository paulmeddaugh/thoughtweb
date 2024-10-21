import { comparePositions, isValidPosition, positionBefore, positionAfter, positionBetween } from './customOrderingAsStrings.js';

describe("String Defined Ordering", () => {
    test("Logs methods to see it practically", () => {
        console.log(isValidPosition('A'));
        console.log("position before A:", positionBefore('A'));
        console.log("position after A:", positionAfter('A'));
        console.log("position after Z:", positionAfter('Z'));
        console.log("position after z:", positionAfter('z'));
        console.log("position after ~:", positionAfter('~'));
        console.log("position after A:", positionAfter('A'));
        console.log("position after /:", positionAfter('/'));
        console.log("position between A and B:", positionBetween('A', 'B'));
        console.log("position between A and ~:", positionBetween('A', '~'));
        console.log("comparator value of A and B", comparePositions('A', 'B'));
        console.log("comparator value of B and A", comparePositions('B', 'A'));
    });
});