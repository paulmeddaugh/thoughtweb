import { checkIfNoteProps } from "../utility/errorHandling.js";
import { stringFromSQL } from "../utility/utility.js";
import Point from "./point.js";

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
    point = null;

    constructor (id, title, text, quotes, idNotebook, main, dateCreated, allNotesPosition, point) {

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
        this.setPoint(point);
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

    setPoint(point) {
        if (point && !(point.hasOwnProperty('x') && point.hasOwnProperty('y'))) {
            throw new Error("A Note's point must be null or have 'x' and 'y' properties.");
        }

        this.point = point;
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
        const { id, title, text, quotes, idNotebook, main, dateCreated, allNotesPosition, point } = noteObject;
        return new Note(
            id, 
            stringFromSQL(title), 
            stringFromSQL(text), 
            stringFromSQL(quotes), 
            idNotebook,
            main, 
            dateCreated, 
            allNotesPosition,
            point,
        );
    }

    static fromJournalEndpoint (noteData) {
        const { id, title, text, quotes, idNotebook, isMain, dateCreated, allNotesPosition, x, y } = noteData;
        return new Note(
            id, 
            stringFromSQL(title), 
            stringFromSQL(text), 
            stringFromSQL(quotes), 
            idNotebook,
            isMain, 
            dateCreated, 
            allNotesPosition,
            new Point(x, y)
        );
    }

    static toUpdateDTO (note, idUser) {
        const newNote = { 
            ...note, 
            idUser, 
            isMain: note.main,
            x: note?.point?.x,
            y: note?.point?.y,
        }
        delete newNote.main;
        delete newNote.point;
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