import { useEffect, useRef } from "react";

const Canvas = ({ draw, resizeRef }) => {
    let canvasRef = useRef(null);

    useEffect(() => {
        const resize = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;
            
            const { width, height } = canvas.getBoundingClientRect();

            if (canvas.width !== width || canvas.height !== height) {
                const { devicePixelRatio:ratio=1 } = window;
                const context = canvas.getContext('2d');
                canvas.width = width*ratio;
                canvas.height = height*ratio;
                context.scale(ratio, ratio);

                return true;
            }

            return false;
        }
        resize();

        (resizeRef.current || window).addEventListener("resize", resize);
        (resizeRef.current || window).addEventListener("overflow", resize);
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const c2d = canvas.getContext('2d');
        let frameCount = 0, animationId;

        const render = () => {
            frameCount++;
            draw?.(c2d, frameCount);
            animationId = window.requestAnimationFrame(render);
        }
        render();

        return () => {
            window.cancelAnimationFrame(animationId);
        }

    }, [draw]);

    return <canvas ref={canvasRef}></canvas>
}

export default Canvas;