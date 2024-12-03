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

    static equals (p1, p2) {
        if (!Point.hasPointProperties(p1) || !Point.hasPointProperties(p2)) return false;
        return p1.x === p2.x 
            && p1.y === p2.y;
    }

    /**
    * Checks if the object is a {@link Point} object purely based on having declared the Point properties.
    * 
    * @param {*} p the Object to check.
    * @returns true if so, and false otherwise.
    */
    static hasPointProperties (p) {
        if (p?.hasOwnProperty('x') && p?.hasOwnProperty('y')) return true;
        return false;
    }

    static isCoordinatesZeroZero (p) {
        if (!Point.hasPointProperties(p)) return false;
        return (p.x === 0 && p.y === 0);
    }

    static toInlineStyle (point) {
        if (!Point.hasPointProperties(point)) return {};
        return { left: point.x, top: point.y };
    }

    static fromInlineStyle (style) {
        return (style?.left && style?.top)
            ? new Point(style.left, style.top)
            : null;
    }
}