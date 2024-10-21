import { checkIfNumbers } from '../utility/errorHandling.js';

/**
 * An object that holds 'x', 'y', and 'name' properties.
 */
 export default class Point {

    x = 0;
    y = 0;

    /**
     * Can take up to three arguments: two arguments to set the 'x' and 'y' properties, and three
     * to set the 'x,' 'y,' and 'name' properties.
     * 
     * @param {*} x Typically the 'x' co-ordinate on a plane.
     * @param {*} y Typically the 'y' co-ordinate on a plane.
     */
    constructor (x, y) {
        checkIfNumbers({ x, y });

        this.x = x;
        this.y = y;
    }

    /**
    * Checks if the object is a {@link Point} object purely based on having declared the Point properties.
    * 
    * @param {*} o the Object to check.
    * @returns true if so, and false otherwise.
    */
    static hasPointProperties (o) {
        if (o.hasOwnProperty('x') && o.hasOwnProperty('y')) return true;
        return false;
    }
}