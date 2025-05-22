import { useCallback, useRef } from "react";

interface UseScreenshotOptions {
  quality?: number;
  filename?: string;
  onScreenshotTaken?: (dataUrl: string) => void;
  onError?: (error: Error) => void;
}

interface UseScreenshotReturn {
  takeScreenshot: (
    videoElement?: HTMLVideoElement | null,
    filterCanvas?: HTMLCanvasElement | null
  ) => Promise<string | null>;
  downloadScreenshot: (
    videoElement?: HTMLVideoElement | null,
    filterCanvas?: HTMLCanvasElement | null
  ) => Promise<void>;
  lastScreenshot: string | null;
  setElementRef: (element: HTMLElement | null) => void;
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

  // Function to take a screenshot by combining video and canvas
  const takeScreenshot = useCallback(
    async (
      videoElement?: HTMLVideoElement | null,
      filterCanvas?: HTMLCanvasElement | null
    ): Promise<string | null> => {
      try {
        // Get video element if not provided
        const video =
          videoElement || elementRef.current?.querySelector("video");
        if (!video) {
          throw new Error("No video element found for screenshot");
        }

        // Check if video is ready
        if (video.readyState < 2) {
          throw new Error("Video not ready for screenshot");
        }

        // Create a canvas to combine video and filters
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          throw new Error("Could not get canvas context");
        }

        // Set canvas dimensions to match video
        canvas.width = video.videoWidth || video.clientWidth;
        canvas.height = video.videoHeight || video.clientHeight;

        // Draw the video frame to canvas
        ctx.save();

        // Handle mirrored video
        const isVideoMirrored = video.style.transform.includes("scaleX(-1)");
        if (isVideoMirrored) {
          ctx.scale(-1, 1);
          ctx.translate(-canvas.width, 0);
        }

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.restore();

        // Draw the filter overlay if available
        const overlay =
          filterCanvas || elementRef.current?.querySelector("canvas");
        if (overlay && overlay.width > 0 && overlay.height > 0) {
          // Scale overlay to match canvas dimensions
          const scaleX = canvas.width / overlay.width;
          const scaleY = canvas.height / overlay.height;

          ctx.save();
          if (isVideoMirrored) {
            ctx.scale(-1, 1);
            ctx.translate(-canvas.width, 0);
          }
          ctx.scale(scaleX, scaleY);
          ctx.drawImage(overlay, 0, 0);
          ctx.restore();
        }

        // Convert to data URL
        const dataUrl = canvas.toBlob
          ? await new Promise<string>((resolve) => {
              canvas.toBlob(
                (blob) => {
                  if (blob) {
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result as string);
                    reader.readAsDataURL(blob);
                  } else {
                    resolve(canvas.toDataURL("image/jpeg", quality));
                  }
                },
                "image/jpeg",
                quality
              );
            })
          : canvas.toDataURL("image/jpeg", quality);

        // Store the screenshot
        screenshotRef.current = dataUrl;

        if (onScreenshotTaken) {
          onScreenshotTaken(dataUrl);
        }

        return dataUrl;
      } catch (error) {
        console.error("Error taking screenshot:", error);

        const screenshotError =
          error instanceof Error
            ? error
            : new Error("Unknown screenshot error");

        if (onError) {
          onError(screenshotError);
        }

        return null;
      }
    },
    [quality, onScreenshotTaken, onError]
  );

  // Function to download the screenshot
  const downloadScreenshot = useCallback(
    async (
      videoElement?: HTMLVideoElement | null,
      filterCanvas?: HTMLCanvasElement | null
    ): Promise<void> => {
      // Take a screenshot first if we don't have one stored
      const dataUrl =
        screenshotRef.current ||
        (await takeScreenshot(videoElement, filterCanvas));

      if (!dataUrl) {
        throw new Error("Failed to capture screenshot");
      }

      // Create a link element to download the image
      const link = document.createElement("a");
      link.download = `${filename}-${new Date().getTime()}.jpg`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    [filename, takeScreenshot]
  );

  return {
    takeScreenshot,
    downloadScreenshot,
    lastScreenshot: screenshotRef.current,
    setElementRef,
  };
}
