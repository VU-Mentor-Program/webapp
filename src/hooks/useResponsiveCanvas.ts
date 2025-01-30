import { useState, useEffect } from "react";

/**
 * A hook that returns { width, height } for a canvas,
 * shrinking below the default if the screen is too narrow.
 */
export function useResponsiveCanvas(defaultWidth: number, defaultHeight: number) {
  const [canvasSize, setCanvasSize] = useState({ width: defaultWidth, height: defaultHeight });

  useEffect(() => {
    function handleResize() {
      // The maximum width is the default, but for small screens,
      // we use e.g. 90% of window.innerWidth
      let newWidth = Math.min(window.innerWidth * 0.9, defaultWidth);
      // Keep the same aspect ratio
      let newHeight = (newWidth / defaultWidth) * defaultHeight;

      setCanvasSize({ width: newWidth, height: newHeight });
    }
    window.addEventListener("resize", handleResize);
    handleResize(); // run on mount
    return () => window.removeEventListener("resize", handleResize);
  }, [defaultWidth, defaultHeight]);

  return canvasSize;
}
