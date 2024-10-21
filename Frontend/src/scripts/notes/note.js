import { checkIfNoteProps } from "../utility/errorHandling.js";

export default class Note {
    id = null;
    title = "";
    idEmotion = null;
    text = "";
    quotes = "";
    idNotebook = null;
    main = null;
    dateCreated = null;
    allNotesPosition = null;

    constructor (id, title, text, quotes, idNotebook, main, dateCreated, allNotesPosition) {

        // Clones a note object
        if (arguments.length === 1 && id && checkIfNoteProps({ id })) {
            let cloneNote = new Note();
            for (let prop in id) {
                cloneNote[prop] = id[prop];
            }
            return cloneNote;
        }

        this.id = id;
        this.setEditables(idNotebook, title, text, quotes, main);
        this.setDateCreated(dateCreated);
        this.setAllNotesPosition(allNotesPosition);
    }

    setId(id) {
        this.id = id;
    }
    setTitle(title) {
        this.title = title;
    }
    setIdEmotion(idEmotion) {
        this.idEmotion = idEmotion;
    }
    setText(text) {
        this.text = text;
    }
    setQuotes(quotes) {
        this.quotes = quotes;
    }
    setIdNotebook(idNotebook) {
        this.idNotebook = idNotebook;
    }
    setMain(main) {
        this.main = main;
    }
    setDateCreated(date) {
        this.dateCreated = new Date(date);
    }
    setAllNotesPosition(position) {
        this.allNotesPosition = position;
    }

    setEditables (idNotebook, title, text, quotes, isMain) {
        this.setIdNotebook(idNotebook);
        this.setTitle(title);
        this.setText(text);
        this.setQuotes(quotes);
        this.setMain(isMain);
    }
}