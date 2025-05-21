import { useCallback, useRef } from "react";
import { toJpeg } from "html-to-image";

interface UseScreenshotOptions {
  quality?: number;
  filename?: string;
  onScreenshotTaken?: (dataUrl: string) => void;
  onError?: (error: Error) => void;
}

interface UseScreenshotReturn {
  takeScreenshot: () => Promise<string | null>;
  downloadScreenshot: () => Promise<void>;
  lastScreenshot: string | null;
}

export function useScreenshot({
  quality = 0.95,
  filename = "ar-face-filter",
  onScreenshotTaken,
  onError,
}: UseScreenshotOptions = {}): UseScreenshotReturn {
  const screenshotRef = useRef<string | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  // Function to set the element reference
  const setElementRef = useCallback((element: HTMLElement | null) => {
    elementRef.current = element;
  }, []);

  // Function to take a screenshot
  const takeScreenshot = useCallback(async (): Promise<string | null> => {
    if (!elementRef.current) return null;

    try {
      // Use html-to-image to capture the element
      const dataUrl = await toJpeg(elementRef.current, {
        quality,
        cacheBust: true,
        canvasWidth: elementRef.current.clientWidth,
        canvasHeight: elementRef.current.clientHeight,
        style: {
          // Ensure any filters or effects are captured
          filter: window.getComputedStyle(elementRef.current).filter,
        },
      });

      // Store the screenshot
      screenshotRef.current = dataUrl;

      if (onScreenshotTaken) {
        onScreenshotTaken(dataUrl);
      }

      return dataUrl;
    } catch (error) {
      console.error("Error taking screenshot:", error);

      if (onError && error instanceof Error) {
        onError(error);
      }

      return null;
    }
  }, [quality, onScreenshotTaken, onError]);

  // Function to download the screenshot
  const downloadScreenshot = useCallback(async (): Promise<void> => {
    // Take a screenshot first if we don't have one stored
    const dataUrl = screenshotRef.current || (await takeScreenshot());

    if (!dataUrl) return;

    // Create a link element to download the image
    const link = document.createElement("a");
    link.download = `${filename}-${new Date().getTime()}.jpg`;
    link.href = dataUrl;
    link.click();
  }, [filename, takeScreenshot]);

  return {
    takeScreenshot,
    downloadScreenshot,
    lastScreenshot: screenshotRef.current,
    setElementRef,
  };
}

// Updated App.tsx implementation of screenshot functionality
// In src/components/App.tsx, update the screenshot related code:

// Initialize screenshot functionality with ref
const { takeScreenshot, downloadScreenshot, setElementRef } = useScreenshot({
  filename: "ar-face-filter",
  onScreenshotTaken: (dataUrl) => {
    // Show a brief flash effect
    if (mainContainerRef.current) {
      mainContainerRef.current.classList.add("screenshot-flash");
      setTimeout(() => {
        mainContainerRef.current?.classList.remove("screenshot-flash");
      }, 300);
    }

    // Download the image
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `ar-face-filter-${new Date().toISOString()}.jpg`;
    link.click();
  },
});

// Add effect to set element ref when mainContainerRef changes
useEffect(() => {
  if (mainContainerRef.current) {
    setElementRef(mainContainerRef.current);
  }
}, [mainContainerRef.current, setElementRef]);

// Handle screenshot button click - no need for arguments now
const handleScreenshot = useCallback(() => {
  takeScreenshot();
}, [takeScreenshot]);
