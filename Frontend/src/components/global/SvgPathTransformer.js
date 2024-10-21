import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import { getIndex, useFlubber } from "../../hooks/useFlubber";
import { useEffect, useMemo } from "react";

export default function SvgPathTransformer ({ startingPath, startingColor, endingPath, endingColors, 
    onFinishExitAnimation, duration = 1, ...props }) {

    const progress = useMotionValue(0);
    const paths = useMemo(() => [startingPath, endingPath], [startingPath, endingPath]);
    const fill1 = useTransform(progress, paths.map(getIndex), [startingColor, endingColors[0][0]]);
    const fill2 = useTransform(progress, paths.map(getIndex), [startingColor, endingColors[1][0]]);
    const fill3 = useTransform(progress, paths.map(getIndex), [startingColor, endingColors[2][0]]);
    const path = useFlubber(progress, paths);

    useEffect(() => {
        const animation = animate(progress, 1, {
            duration,
            ease: "easeInOut",
            onComplete: () => {
                onFinishExitAnimation?.();
            }
        });
    }, [onFinishExitAnimation, duration]);

    return (
        <>
            <motion.svg 
                width="100vw" 
                height="100vh" 
                viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`}
                {...props}
            >
                <motion.path d={path} fill={`url(#linear-grad-ending-color) ${endingColors[0][0]}`} />
            </motion.svg>
            {endingPath?.length && (
                <svg 
                    width="0" 
                    height="0" 
                    style={{ position: 'absolute' }}
                    viewBox={`0 0 ${window.innerWidth} ${window.innerHeight}`}
                >
                    <linearGradient 
                        id="linear-grad-ending-color" 
                        x2="1" 
                        y2="1"
                        gradientTransform="rotate(-45)"
                    >
                        {/* {gradientColors.map((vals, i) => (
                            <stop key={i} offset={`${vals[1]}%`} stopColor={vals[0]} />
                        ))} */}
                        <motion.stop offset={`${endingColors[0][1]}%`} stopColor={fill1} />
                        <motion.stop offset={`${endingColors[1][1]}%`} stopColor={fill2} />
                        <motion.stop offset={`${endingColors[2][1]}%`} stopColor={fill3} />
                    </linearGradient>
                </svg>
            )}
        </>
    )
}