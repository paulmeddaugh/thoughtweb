import Point from "./point";

export default class Box {
    p1;
    p2;
    id;

    constructor (p1, p2, id) {
        if (!Point.hasPointProperties(p1) || !Point.hasPointProperties(p2)) {
            throw new Error('A Box class must be created from two objects with Point class properties.');
        }

        this.p1 = new Point(
            Math.min(p1.x, p2.x),
            Math.min(p1.y, p2.y)
        );

        this.p2 = new Point(
            Math.max(p1.x, p2.x),
            Math.max(p1.y, p2.y)
        );

        this.id = id;
    }

    isPointWithin (p, offsetX = 0, offsetY = 0) {
        if (!Point.hasPointProperties(p)) {
            throw new Error('The object to check if within a Box must have Point class properties.');
        }

        return p.x >= this.p1.x + offsetX
            && p.x <= this.p2.x + offsetX
            && p.y >= this.p1.y + offsetY
            && p.y <= this.p2.y + offsetY;
    }

    static fromElement (el, id, offsetX, offsetY) {
        const { left, top, width, height } = el.getBoundingClientRect();
        return new Box(
            new Point(left - offsetX, top - offsetY),
            new Point(left - offsetX + width, top - offsetY + height),
            id
        );
    }
}