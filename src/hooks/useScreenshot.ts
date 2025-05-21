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

  // Function to take a screenshot
  const takeScreenshot = useCallback(
    async (elementRef: HTMLElement): Promise<string | null> => {
      if (!elementRef) return null;

      try {
        // Use html-to-image to capture the element
        const dataUrl = await toJpeg(elementRef, {
          quality,
          cacheBust: true,
          canvasWidth: elementRef.clientWidth,
          canvasHeight: elementRef.clientHeight,
          style: {
            // Ensure any filters or effects are captured
            filter: window.getComputedStyle(elementRef).filter,
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
    },
    [quality, onScreenshotTaken, onError]
  );

  // Function to download the screenshot
  const downloadScreenshot = useCallback(
    async (elementRef: HTMLElement): Promise<void> => {
      // Take a screenshot first if we don't have one stored
      const dataUrl =
        screenshotRef.current || (await takeScreenshot(elementRef));

      if (!dataUrl) return;

      // Create a link element to download the image
      const link = document.createElement("a");
      link.download = `${filename}-${new Date().getTime()}.jpg`;
      link.href = dataUrl;
      link.click();
    },
    [filename, takeScreenshot]
  );

  return {
    takeScreenshot,
    downloadScreenshot,
    lastScreenshot: screenshotRef.current,
  };
}
