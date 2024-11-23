import { checkIfNoteProps } from "../utility/errorHandling.js";
import { stringFromSQL } from "../utility/utility.js";

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

    static from (noteObject) {
        if (!noteObject) {
            return new Note();
        }
        const { id, title, text, quotes, idNotebook, main, dateCreated, allNotesPosition } = noteObject;
        return new Note(
            id, 
            stringFromSQL(title), 
            stringFromSQL(text), 
            stringFromSQL(quotes), 
            idNotebook,
            main, 
            dateCreated, 
            allNotesPosition
        );
    }

    static fromJournalEndpoint (noteData) {
        // Revise when migrating
        const { id, title, text, quotes, idNotebook, isMain, dateCreated, globalOrder } = noteData;
        return new Note(
            id, 
            stringFromSQL(title), 
            stringFromSQL(text), 
            stringFromSQL(quotes), 
            idNotebook,
            isMain, 
            dateCreated, 
            globalOrder
        );
    }

    static toUpdateDTO (note, idUser) {
        const newNote = { 
            ...note, 
            idUser, 
            globalOrder: note.allNotesPosition,
            isMain: note.main,
        }
        delete newNote.allNotesPosition;
        delete newNote.main;
        return newNote;
    }

    equals (note) {
        if (!note?.id) return false;
        return this.id === note.id
            && this.title?.replace('﻿', '') === note.title?.replace('﻿')
            && this.idEmotion === note.idEmotion
            && this.text === note.text
            && this.quotes === note.quotes
            && this.idNotebook === note.idNotebook
            && this.main === note.main
            && this.dateCreated.getTime() === note.dateCreated.getTime()
            && this.allNotesPosition === note.allNotesPosition;
    }
}