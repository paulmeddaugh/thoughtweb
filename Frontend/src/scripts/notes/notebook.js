export default class Notebook {
    id;
    name;
    idUser;
    dateCreated;
    noteOrder = {};

    constructor (id, name, idUser, dateCreated, noteOrder) {
        this.id = id;
        this.name = name;
        this.idUser = idUser;
        this.dateCreated = dateCreated;
        this.noteOrder = noteOrder;
    }

    setId (id) {
        this.id = id;
        return this;
    }

    setDateCreated (dateCreated) {
        this.dateCreated = dateCreated;
        return this;
    }

    reorder (noteId, position) {
        this.noteOrder = { [noteId]: position };
        return this;
    }

    rename (name) {
        this.name = name;
        return this;
    }

    static clone(notebook) {
        const { id, name, idUser, dateCreated, noteOrder } = notebook;
        return new Notebook(id, name, idUser, dateCreated, noteOrder);
    }

    static creationRequestDTO (name, idUser) {
        return { name, idUser };
    }

    static fromCreationResponse (response) {
        const { id, name, idUser, dateCreated, noteOrder } = response.data;
        return new Notebook(id, name, idUser, dateCreated, noteOrder);
    }
}