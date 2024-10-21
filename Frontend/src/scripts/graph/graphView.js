import Graph from './graph.js';
import Note from '../notes/note.js';
import Point from '../notes/point.js';
import { checkIfNoteProps, checkIfPoints, checkIfString } from '../utility/errorHandling.js';

let canvas;
let ctx;

export function displayMainNoteOnWall(note, point) {
    displayOnWall("main", note, point);
}

export function displayStickyNoteOnWall(note, point) {
    displayOnWall("sticky", note, point);
}

/**
 * 
 * @param {string} typeOfNote  The type of note to display as, being values "main" or "sticky". 
 * @param {Note} note The note to display.
 * @param {Point} point The point to place the note within the main content "Journal wall" area.
 */
function displayOnWall(typeOfNote, note, point) {

    checkIfString({ typeOfNote });
    checkIfNoteProps({ note });
    checkIfPoints({ point });

    let div = document.createElement('div');
    div.classList.add(typeOfNote + "Note");
    div.style.left = point.x + 'px';
    div.style.top = point.y + 'px';

    addElement('h5', ['mainNoteTitle'], note.title);
    addElement('p', ['mainNoteText'], note.text);
    addElement('p', ['connectionText'], 'Drag from note to add connection');

    function addElement(elementTag, classNames, text) {
        let element = document.createElement(elementTag);
        classNames.forEach(val => element.classList.add(val));
        element.innerHTML = text;
        div.appendChild(element);
    }

    document.getElementById('content').appendChild(div);
}

window.addEventListener("load", () => {
    canvas = document.getElementById('background');
    ctx = canvas.getContext('2d');
});

/**
 * Sizes a canvas by the specified width and height multiplied by the devicePixelRatio, and puts it in the 
 * designated display width and height through styling to draw per pixel on the device despite the 
 * monitor's set pixel ratio.
 * 
 * @param {Number} width The width to 'place' the canvas in. If not specified, defaults to #graphView width.
 * @param {Number} height The height to 'place' the canvas in. If not specified, defaults to #graphView height.
 */
 export function scaleToDPR (width, height) {
    
    if (width === undefined) {
        width = canvas.getBoundingClientRect().width;
    } else if (isNaN(width)) {
        throw new TypeError ("'width' must be a number.");
    }

    if (height === undefined) {
        height = canvas.getBoundingClientRect().height;
    } else if (isNaN(height)) {
        throw new TypeError ("'height' must be a number.");
    }

    const DPR = window.devicePixelRatio;

    // Set the "actual" size of the canvas
    canvas.width = width * DPR;
    canvas.height = height * DPR;

    // Scale the context to ensure correct drawing operations
    canvas.getContext('2d').scale(DPR, DPR);

    // Set the "drawn" size of the canvas
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
}

/**
 * Draws a line from a main note to a supporting note using their centers. Assumes note elements 
 * have already been created to find their center points.
 * 
 * @param {Point} mainPoint The top left point of a note.
 * @param {Point} supportingPoint The top left point of a note to connect the main note to.
 */
export function addConnection(mainPoint, supportingPoint) {

    // Assumes note elements have already been created
    let mainEl = document.getElementsByClassName('mainNote')[0];
    let supportingEl = document.getElementsByClassName('stickyNote')[0];

    let mainCenter = new Point(
        mainPoint.x + (parseInt(window.getComputedStyle(mainEl).width) / 2),
        mainPoint.y + (parseInt(window.getComputedStyle(mainEl).height) / 2)
    );

    let supportingCenter = new Point(
        supportingPoint.x + (parseInt(window.getComputedStyle(supportingEl).width) / 2),
        supportingPoint.y + (parseInt(window.getComputedStyle(supportingEl).height) / 2)
    );

    ctx.lineWidth = 1;
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(mainCenter.x, mainCenter.y);
    ctx.lineTo(supportingCenter.x, supportingCenter.y);
    ctx.closePath();
    ctx.stroke();
} 