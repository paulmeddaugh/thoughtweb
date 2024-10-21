import { checkIfString } from './errorHandling.js';

/**
 * Removes all HTML and non-SQL characters from a string.
 * 
 * @param {string} string The string to check and remove from.
 * @returns A string able to be queried.
 */
export function stringToSQL (string) {
    checkIfString({ string });
    return string.replace(/<[^>]*>/g, "").replace(/'/g, "''");
}

/**
 * Removes all added characters a string returned from an SQL query.
 * 
 * @param {string} string The string to reformat.
 * @returns The string before its insertion to the database.
 */
export function stringFromSQL (string) {
    checkIfString({ string });
    return string.replace(/''/g, "'");
}

/**
 * Binary searches through an array of objects with 'id' properties for a specified 'id,' and by default
 * skips the first index. Returns an empty array if not found. O(log n) time complexity.
 * 
 * @param {Array} arr The array of objects with 'id' properties.
 * @param {Number} val The value sought for in the array.
 * @param {Number} skipFirst A number indicating the index to start the search in the array. Defaults to 0.
 * @returns An array containing the object with the 'id' value as first index and the index for 
 * the object in the array as second if found. Otherwise, returns an empty array.
 */
export function binarySearch(arr, val, skipTo = 0, arrPropPath = 'id', comparator) {

    const arrPath = arrPropPath.split('.');
    if (!comparator) comparator = (a, b) => b - a;

    let low = skipTo, high = arr.length - 1;
    let mid = 0|(low + (high - low) / 2);
    let found = false;

    while (high >= low) {

        // Gets comparing arr value from arr using arrPropPath
        let arrVal = arr;
        for (let i = -1; i < arrPath.length; i++) {
            arrVal = (i === -1) ? arrVal[mid] : arrVal[arrPath[i]];
        }

        const comparatorReturn = comparator(val, arrVal);

        if (comparatorReturn < 0) { // Greater than mid
            low = mid + 1;
            mid = 0|(low + (high - low) / 2);
        } else if (comparatorReturn > 0) { // Less than mid
            high = mid - 1;
            mid = 0|(low + (high - low) / 2);
        } else { // Found
            found = true;
            high = low - 1;
        }
    }

    return (found) ? [arr[mid], mid] : [];
}

/** 
 * Binary inserts an object into an ordered array, with the ordering property defaulted to 'id': O(log n)
 * 
 * @return The array with the inserted value if successful. 
 */
export function binaryInsert (arr, obj, arrPropPath = 'v.id', objPropPath = 'id') {

    const arrPath = arrPropPath?.split('.'), objPath = objPropPath?.split('.');
    let objVal, i;

    // Checks comparing obj value using objPropPath
    for (objVal = obj, i = 0; i < objPath.length; i++) {
        objVal = objVal[objPath[i]];
        if (!obj) throw new TypeError('The object to insert must have a comparable property at the ' +
            "objPropPath, which defaults to 'id'.");
    }

    let high = arr.length - 1, low = 0, mid = 0|(high / 2);
    while (high >= low) {

        // Gets comparing arr value from arr using arrPropPath
        let arrVal;
        for (arrVal = arr, i = -1; i < arrPath.length; i++) {
            arrVal = (i === -1) ? arrVal[mid] : arrVal[arrPath[i]];
        }

        if (arrVal > objVal) { // less than mid
            high = mid - 1;
            mid = 0|(low + (high - low) / 2);
        } else { // greater than mid
            low = mid + 1;
            mid = 0|(low + (high - low) / 2);
        }
    }

    arr.splice(Math.max(low, high), 0, (arrPath.length === 1) ? obj : { v: obj });
    return arr;
}

export const triggerNativeEventFor = (elm, { event, ...valueObj }) => {
    if (!(elm instanceof Element)) {
        throw new Error(`Expected an Element but received ${elm} instead!`);
    }
  
    const [prop, value] = Object.entries(valueObj)[0] ?? [];
    const desc = Object.getOwnPropertyDescriptor(elm.__proto__, prop);
  
    desc?.set?.call(elm, value);
    elm.dispatchEvent(new Event(event, { bubbles: true }));
};

export const isDev = () => {
    return !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
};

export const memoize = (fn) => {
    const cache = {};
    return (...args) => {
        const n = args[0];
        if (n in cache) {
            return cache[n];
        } else {
            const result = fn(...args);
            return cache[n] = result;
        }
    }
};

export const colorToRgb = (color) => {

    if (typeof color !== 'string') {
        throw new Error('Color to convert must be a string: ' + color);
    }

    if (color.substring(0, 3) === 'rgb') {
        return color;
    }

    if (color[0] === '#') {
        let rgb = 'rgb(';
        for (let i = 1; i < color.length; i = i + 2) {
            rgb += parseInt(`${color[i]}${color[i + 1]}`, 16) + ', ';
        }
        return rgb.substring(0, rgb.length - 2) + ')';
    }

    // a default color name
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    context.fillStyle = color;
    context.fillRect(0,0,1,1);
    return context.getImageData(0,0,1,1).data;
}

export const getRGBColorValues = (rgbColor) => {
    if (rgbColor.substring(0, 3) !== 'rgb') {
        throw new Error('Color to get rgb values from must be an rgb formatted color.');
    }

    return rgbColor
        .substring(rgbColor.indexOf('(') + 1, rgbColor.indexOf(')'))
        .split(',')
        .map(val => parseInt(val))
}

export const colorTransformer = (fromColor, toColor, progress) => {
    fromColor = getRGBColorValues(colorToRgb(fromColor));
    toColor = getRGBColorValues(colorToRgb(toColor));

    return 'rgb(' + toColor
        .map((val, i) => interpolate(val, toColor[i], progress))
        .join(', ')
     + ')';
}

export function invertPercent (percent) {
    const percentRecip = 1 / (!percent ? 1 : percent);
    return (percentRecip - (percent ? 1 : 0)) / percentRecip;
}

export const interpolate = (from, to, progress) => {
    const progressInvert = invertPercent(progress);
    const valDif = from - to;
    return to + valDif * progressInvert;
}