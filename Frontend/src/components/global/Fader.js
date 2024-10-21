import { motion, useAnimate } from "framer-motion"
import { useEffect } from "react";

export default function Fader ({ fadeIn, fadeOut, duration = 1, onFadeOutFinish, children, ...props }) {

    const [scope, animate] = useAnimate();

    useEffect(() => {
        (async () => {
            if (fadeOut) {
                await animate(scope.current, { opacity: 0, duration });
                onFadeOutFinish?.();
            }
        })();
    }, [fadeOut]);

    return (
        <motion.div 
            initial={{ opacity: fadeIn ? 0 : 1, duration }} 
            animate={fadeIn ? { opacity: 1, duration } : {}}
            ref={scope}
            {...props}
        >
            {children}
        </motion.div>
    );
}