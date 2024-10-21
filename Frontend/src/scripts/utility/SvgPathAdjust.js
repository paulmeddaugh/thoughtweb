const LINE_WIDTH = 2;
const CENTER_CIRCLE_RADIUS = 2;

export const svgPathFromPreloaderLines = (lines) => {
    const centerX = window.innerWidth / 2, centerY = window.innerHeight / 2
    let pathData1 = `M${centerX} ${centerY} `, pathData2 = '';

    for (let [x1, y1, x2, y2] of lines) {
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const cx = centerX - CENTER_CIRCLE_RADIUS * Math.cos(angle);
        const cy = centerY - CENTER_CIRCLE_RADIUS * Math.sin(angle);
        pathData1 += `L${x1} ${y1} L${cx - 1} ${cy} `;
        pathData2 += `L${x2} ${y2} L${cx + 1} ${cy} `;
    }

    return `${pathData1}${pathData2} L${centerX} ${centerY}Z`;
}

export const getPathCommands = (path) => {
    return String(path).match(/[a-zA-Z]+/g);
}

export const scalePath = (path, scale = 1) => {
    return manipulatePathNumbers(path, x => x * scale, y => y * scale);
};

export const scalePathTo = (path, fromWidth, fromHeight, toWidth, toHeight) => {
    const xScale = toWidth / fromWidth;
    const yScale = toHeight / fromHeight;
    return manipulatePathNumbers(path, x => x * xScale, y => y * yScale);
};

export const translatePath = (path, byX, byY) => {
    return manipulatePathNumbers(path, x => x + byX, y => y + byY);
}

export const manipulatePathNumbers = (path, xfn, yfn) => {
    return path
        .match(/[A-Za-z]?[0-9.]+[ ,][0-9.]+/g) // optional command with x and y for point
        .map(val => {
            const hasCommand = val[0] >= 'A' && val[0] <= 'z';
            const delimIndex = String(val).indexOf(' ') !== -1 
                ? String(val).indexOf(' ')
                : String(val).indexOf(',');
            const x = Number(val.substring(hasCommand ? 1 : 0, delimIndex));
            const y = Number(val.substring(delimIndex + 1));
            
            return `${hasCommand ? val[0] : ''}${xfn(x)} ${yfn(y)}`;
        })
        .join(' ') + 'Z';
};