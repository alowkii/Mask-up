import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import { ERROR_MESSAGES } from "../constants";

interface WebcamViewProps {
  onVideoReady: (videoElement: HTMLVideoElement) => void;
  className?: string;
  mirrored?: boolean;
}

const WebcamView: React.FC<WebcamViewProps> = ({
  onVideoReady,
  className = "",
  mirrored = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const webcamRef = useRef<Webcam>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [isWebcamReady, setIsWebcamReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");

  // Handle successful webcam initialization
  const handleUserMedia = (stream: MediaStream) => {
    console.log("✅ Webcam stream received successfully");
    setIsWebcamReady(true);
    setError(null);

    // Pass the video element to parent after a short delay to ensure it's ready
    setTimeout(() => {
      if (webcamRef.current && webcamRef.current.video) {
        console.log("📹 Passing video element to parent component");
        onVideoReady(webcamRef.current.video);
      }
    }, 100);
  };

  // Handle webcam errors
  const handleWebcamError = (error: string | DOMException) => {
    console.error("❌ Webcam error:", error);

    let webcamError: Error;
    if (typeof error === "string") {
      webcamError = new Error(error);
    } else if (error instanceof DOMException) {
      switch (error.name) {
        case "NotAllowedError":
          webcamError = new Error(
            "Camera access denied. Please allow camera access and reload the page."
          );
          break;
        case "NotFoundError":
          webcamError = new Error(
            "No camera found. Please connect a camera and try again."
          );
          break;
        case "NotReadableError":
          webcamError = new Error(
            "Camera is already in use by another application."
          );
          break;
        case "OverconstrainedError":
          webcamError = new Error(
            "Camera constraints not supported. Trying with basic settings..."
          );
          break;
        default:
          webcamError = new Error(`Camera error: ${error.message}`);
      }
    } else {
      webcamError = new Error(ERROR_MESSAGES.WEBCAM_ACCESS);
    }

    setError(webcamError);
    setIsWebcamReady(false);
  };

  // Switch between front and back cameras
  const switchCamera = () => {
    console.log("🔄 Switching camera");
    setFacingMode((prevMode) => (prevMode === "user" ? "environment" : "user"));
  };

  // Update dimensions on window resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.floor(width),
          height: Math.floor(height),
        });
      }
    };

    // Use ResizeObserver for better performance
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Initial update
    updateDimensions();

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  // Video constraints with optimized settings
  const videoConstraints = {
    width: { ideal: 1280, min: 640 },
    height: { ideal: 720, min: 480 },
    facingMode,
    frameRate: { ideal: 30, max: 30 },
  };

  return (
    <div
      ref={containerRef}
      className={`video-container relative overflow-hidden bg-black ${className}`}
    >
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center text-center p-4 bg-red-50 z-10">
          <div>
            <div className="text-red-500 mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mx-auto"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <p className="text-red-600 font-medium mb-4">{error.message}</p>
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded transition-colors"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      ) : (
        <>
          <Webcam
            ref={webcamRef}
            audio={false}
            width={dimensions.width || 640}
            height={dimensions.height || 480}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            onUserMedia={handleUserMedia}
            onUserMediaError={handleWebcamError}
            mirrored={mirrored}
            className="absolute top-0 left-0 w-full h-full object-cover"
            style={{
              transform: mirrored ? "scaleX(-1)" : "none",
              zIndex: 1,
            }}
          />

          {!isWebcamReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-20">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-lg">Initializing camera...</p>
                <p className="text-sm text-gray-300 mt-2">
                  Please allow camera access when prompted
                </p>
              </div>
            </div>
          )}

          {isWebcamReady && (
            <button
              onClick={switchCamera}
              className="absolute bottom-4 right-4 bg-black bg-opacity-50 hover:bg-opacity-75 text-white p-3 rounded-full transition-all duration-200 z-30"
              aria-label="Switch camera"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
                <circle cx="12" cy="13" r="3"></circle>
                <path d="m9 13 1.5-1.5L12 13l1.5-1.5L15 13"></path>
              </svg>
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default WebcamView;
