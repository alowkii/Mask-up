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
  currentFacingMode: "user" | "environment";
}

export function useWebcam({
  videoConstraints = {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: "user",
  },
  onUserMedia,
  onError,
}: UseWebcamOptions = {}): UseWebcamReturn {
  const webcamRef = useRef<Webcam>(null);
  const [isWebcamReady, setIsWebcamReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const streamRef = useRef<MediaStream | null>(null);

  // Handle successful webcam initialization
  const handleUserMedia = useCallback(
    (stream: MediaStream) => {
      console.log("Webcam stream received:", stream);
      streamRef.current = stream;
      setIsWebcamReady(true);
      setError(null);
      if (onUserMedia) onUserMedia(stream);
    },
    [onUserMedia]
  );

  // Handle webcam errors
  const handleWebcamError = useCallback(
    (error: string | DOMException) => {
      console.error("Webcam error:", error);

      let webcamError: Error;
      if (typeof error === "string") {
        webcamError = new Error(error);
      } else if (error instanceof DOMException) {
        if (error.name === "NotAllowedError") {
          webcamError = new Error(
            "Camera access denied. Please allow camera access and reload the page."
          );
        } else if (error.name === "NotFoundError") {
          webcamError = new Error(
            "No camera found. Please connect a camera and try again."
          );
        } else if (error.name === "NotReadableError") {
          webcamError = new Error(
            "Camera is already in use by another application."
          );
        } else {
          webcamError = new Error(`Camera error: ${error.message}`);
        }
      } else {
        webcamError = new Error(ERROR_MESSAGES.WEBCAM_ACCESS);
      }

      setError(webcamError);
      setIsWebcamReady(false);
      if (onError) onError(webcamError);
    },
    [onError]
  );

  // Function to capture a screenshot from the webcam
  const captureScreenshot = useCallback((): string | null => {
    if (webcamRef.current && isWebcamReady) {
      try {
        return webcamRef.current.getScreenshot();
      } catch (error) {
        console.error("Screenshot error:", error);
        return null;
      }
    }
    return null;
  }, [isWebcamReady]);

  // Function to switch between front and back cameras
  const switchCamera = useCallback(() => {
    console.log("Switching camera from", facingMode);
    setFacingMode((prevMode) => {
      const newMode = prevMode === "user" ? "environment" : "user";
      console.log("New camera mode:", newMode);
      return newMode;
    });
  }, [facingMode]);

  // Clean up stream when component unmounts
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        console.log("Cleaning up webcam stream");
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
        streamRef.current = null;
      }
    };
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
    currentFacingMode: facingMode,
    videoConstraints: currentVideoConstraints,
    onUserMedia: handleUserMedia,
    onUserMediaError: handleWebcamError,
  };
}
