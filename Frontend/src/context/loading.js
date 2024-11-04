import styles from '../styles/global/Loading.module.css';

import { createContext, useContext, useEffect, useState } from "react";

// preload images
import background from "../resources/backgroundWithoutVignette.png";
import backgroundPortrait from "../resources/backgroundPortrait.jpg";
import justNotebook from "../resources/justNotebook.png";
import journalBackground from "../resources/journalBackground2.png";
import accountBackground from "../resources/accountBackground2 - desktop.png";
import pinIconUnfilled from "../resources/pinIconUnfilled.png";
import pinIconFilled from "../resources/pinIconFilled.png";
import journalGif from "../resources/loadingImages/journalOpen2.gif";
import journalClosed from "../resources/loadingImages/journalClosed.png";

import { usePreload } from "../hooks/usePreload";
import Fader from "../components/global/Fader";
import Loading from "../components/global/Loading";
import { BASE_URL } from '../constants/constants';

const LoadingContext = createContext(null);

const preloadResources = {
    images: [
        background, 
        backgroundPortrait, 
        justNotebook,
        journalBackground, 
        accountBackground, 
        pinIconUnfilled, 
        pinIconFilled,
        journalGif,
        journalClosed
    ],
    fonts: [
        'Abuget',
        'Corbel',
        'Corbel Light'
    ]
};

const queryParameters = new URLSearchParams(window.location.search)
const animation = queryParameters.get("animation") !== 'false';

export const LoadingProvider = ({ children }) => {
    const { isPreloaded, preloadComponents } = usePreload(preloadResources);
    const [isLoadingScreenFading, setLoadingScreenFading] = useState(false);
    const [loading, setLoading] = useState(animation ? { icon: 2 } : { status: 'Loading...', icon: 3 });

    useEffect(() => {
        // Specific to icon 3
        if (loading?.icon === 3 && isPreloaded && !animation) {
            setLoadingScreenFading(true);
        }
    }, [isPreloaded, loading, setLoading]);

    const handlePreloadingAnimationFinished = () => {
        setLoading(false);
        setLoadingScreenFading(false);
    }
    return (
        <LoadingContext.Provider value={{ 
            loading, 
            setLoading, 
            isPreloaded, 
            preloadComponents, 
            isLoadingScreenFading, 
            setLoadingScreenFading
        }}>
            {loading && (
                <Fader 
                    className={styles.fullSize} 
                    fadeOut={isLoadingScreenFading} 
                    style={{ position: 'absolute', zIndex: 20 }}
                    onFadeOutFinish={handlePreloadingAnimationFinished}
                >
                    <Loading 
                        icon={loading.icon ?? 1}
                        status={loading.status ?? ' '}
                        linkText={loading.linkText}
                        linkOnClick={() => setLoading(false)}
                        startExitAnimation={isPreloaded}
                        onFinishExitAnimation={() => setLoadingScreenFading(true)}
                    >
                        {!isPreloaded && preloadComponents}
                    </Loading>
                </Fader>
            )}
            {children}
        </LoadingContext.Provider>
    )
}

export function useLoading() {
    return useContext(LoadingContext);
}