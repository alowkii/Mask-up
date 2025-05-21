import { useState, useEffect, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import { ERROR_MESSAGES } from "../constants";

interface UseWebcamOptions {
  videoConstraints?: MediaTrackConstraints;
  onUserMedia?: (stream: MediaStream) => void;
  onError?: (error: Error) => void;
}

interface UseWebcamReturn {
  webcamRef: React.RefObject<Webcam | null>;
  isWebcamReady: boolean;
  error: Error | null;
  captureScreenshot: () => string | null;
  switchCamera: () => void;
}

export function useWebcam({
  videoConstraints = {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    aspectRatio: 1.777777778,
    facingMode: "user",
  },
  onUserMedia,
  onError,
}: UseWebcamOptions = {}): UseWebcamReturn {
  const webcamRef = useRef<Webcam>(null);
  const [isWebcamReady, setIsWebcamReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  // Handle successful webcam initialization
  const handleUserMedia = useCallback(
    (stream: MediaStream) => {
      setIsWebcamReady(true);
      setError(null);
      if (onUserMedia) onUserMedia(stream);
    },
    [onUserMedia]
  );

  // Handle webcam errors
  const handleWebcamError = useCallback(
    (error: Error) => {
      console.error("Webcam error:", error);
      const webcamError = new Error(ERROR_MESSAGES.WEBCAM_ACCESS);
      setError(webcamError);
      setIsWebcamReady(false);
      if (onError) onError(webcamError);
    },
    [onError]
  );

  // Function to capture a screenshot from the webcam
  const captureScreenshot = useCallback((): string | null => {
    if (webcamRef.current && isWebcamReady) {
      return webcamRef.current.getScreenshot();
    }
    return null;
  }, [isWebcamReady]);

  // Function to switch between front and back cameras
  const switchCamera = useCallback(() => {
    setFacingMode((prevMode) => (prevMode === "user" ? "environment" : "user"));
  }, []);

  // Update video constraints when facingMode changes
  const currentVideoConstraints = {
    ...videoConstraints,
    facingMode,
  };

  // Check browser support
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const browserError = new Error(ERROR_MESSAGES.BROWSER_SUPPORT);
      setError(browserError);
      if (onError) onError(browserError);
    }
  }, [onError]);

  return {
    webcamRef,
    isWebcamReady,
    error,
    captureScreenshot,
    switchCamera,
  };
}
