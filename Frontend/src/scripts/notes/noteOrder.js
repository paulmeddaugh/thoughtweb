export class NoteOrder {
    id;
    order;
    constructor (id, order) {
        this.id = id;
        this.order = order;
    }

    static fromNote(note) {
        return new this(note?.id, note?.allNotesPosition);
    }
}