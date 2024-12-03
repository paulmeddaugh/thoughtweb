import React from "react";
import Point from "../../scripts/notes/point";

const Connection = React.memo(({ pointFrom, pointTo, curveOffset = 50, stroke = 'black', strokeWidth = 2 }) => {
    
    if (!Point.hasPointProperties(pointFrom) || !Point.hasPointProperties(pointTo)) {
        throw new Error("The pointFrom or pointTo prop must be have Point class properties.")
    }

    // Calculate midpoint for the curve
    const midPoint = new Point(
        (pointFrom.x + pointTo.x) / 2,
        (pointFrom.y + pointTo.y) / 2
    );

    // Offset the midpoint for the curve
    const controlPoint = new Point(
        midPoint.x,
        midPoint.y - curveOffset, // Adjust the offset for the curve's height
    );

    const style = Point.toInlineStyle(new Point(
        Math.min(pointFrom.x, pointTo.x), 
        Math.min(pointFrom.y, pointTo.y)
    ));
    const width = Math.abs(pointFrom.x - pointTo.x);
    const height = Math.abs(pointFrom.y - pointTo.y);

    // Generate the SVG path data for the curve
    // const pathData = `M 0,0 Q ${controlPoint.x},${controlPoint.y} ${pointTo.x},${pointTo.y}`;
    const pathData = `M ${pointFrom.x - style.left},${pointFrom.y - style.top} ${pointTo.x - style.left},${pointTo.y - style.top}`;

    return (
        <svg 
            style={style} 
            className="absolute"
            width={width} 
            height={height} 
            viewBox={`0 0 ${width} ${height}`}
            xmlns="http://www.w3.org/2000/svg"
        >
            <path d={pathData} stroke={stroke} strokeWidth={strokeWidth} fill="none" />
        </svg>
    );
}, (prev, props) => {
    return Point.equals(prev.pointFrom, props.pointFrom)
        && Point.equals(prev.pointTo, props.pointTo)
        && prev.curveOffset === props.curveOffset
        && prev.stroke === props.stroke
        && prev.strokeWidth === props.strokeWidth
});

export default Connection;