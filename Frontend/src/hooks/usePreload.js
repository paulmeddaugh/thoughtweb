import { useState, useEffect } from "react";

export const usePreload = (urls) => { // urls: { images: [], fonts: [] }
  
  const [status, setStatus] = useState({ images: false, fonts: false });  
  const [isPreloaded, setPreloaded] = useState(false);
  const [preloadComponents, setPreloadComponents] = useState(null);

  useEffect(() => {

    if (!Array.isArray(urls?.images) && !Array.isArray(urls?.fonts)) return;

    let imageRefs = [];
    setPreloadComponents(urls.images.map((src, i) => {
      return (
        <img
          src={src}
          className="d-none"
          ref={(ref) => imageRefs.push(ref)}
          onLoad={updateImageStatus(imageRefs)}
          onError={updateImageStatus(imageRefs)}
          key={i}
        />
      )
    }));

    function updateImageStatus (images) { // images: HTMLImageElement[]
      setStatus(prev => {return { ...prev, images: images.every((image) => image.complete) }});
    };

    if (imageRefs.length === 0 && urls.fonts.length === 0) {
      setPreloaded(true);
      return;
    }

    (async () => {
      await Promise.allSettled(
        urls.fonts.map(fontName => document.fonts.load(`12px ${fontName}`))
      );
      setStatus(prev => {return { ...prev, fonts: true }});
    })();
    
  }, [urls]);

  useEffect(() => {
    setPreloaded(status.images && status.fonts);
  }, [status, setPreloaded]);

  return { isPreloaded, preloadComponents };
};
