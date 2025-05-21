import React, { useRef, useEffect, useState } from "react";
import Webcam from "react-webcam";
import { useWebcam } from "../hooks/useWebcam";
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
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Initialize webcam with custom hook
  const { webcamRef, isWebcamReady, error, switchCamera } = useWebcam({
    videoConstraints: {
      width: { ideal: 1280 },
      height: { ideal: 720 },
      facingMode: "user",
    },
    onUserMedia: (stream) => {
      if (webcamRef.current && webcamRef.current.video) {
        onVideoReady(webcamRef.current.video);
      }
    },
  });

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

    window.addEventListener("resize", updateDimensions);
    updateDimensions();

    return () => {
      window.removeEventListener("resize", updateDimensions);
    };
  }, []);

  // When webcam is ready, pass the video element to parent component
  useEffect(() => {
    if (isWebcamReady && webcamRef.current && webcamRef.current.video) {
      onVideoReady(webcamRef.current.video);
    }
  }, [isWebcamReady, onVideoReady]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden bg-black ${className}`}
    >
      {error ? (
        <div className="absolute inset-0 flex items-center justify-center text-center p-4 bg-red-100">
          <div>
            <p className="text-red-600 font-medium mb-2">
              {error.message || ERROR_MESSAGES.WEBCAM_ACCESS}
            </p>
            <button
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
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
            width={dimensions.width}
            height={dimensions.height}
            screenshotFormat="image/jpeg"
            videoConstraints={{
              width: dimensions.width,
              height: dimensions.height,
              facingMode: "user",
            }}
            mirrored={mirrored}
            className="absolute top-0 left-0 w-full h-full object-cover"
          />
          {!isWebcamReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="text-white text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
                <p>Initializing camera...</p>
              </div>
            </div>
          )}
          <button
            onClick={switchCamera}
            className="absolute bottom-4 right-4 bg-white bg-opacity-70 hover:bg-opacity-100 p-2 rounded-full text-sm"
            aria-label="Switch camera"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 9v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9"></path>
              <rect x="8" y="3" width="8" height="6" rx="1" ry="1"></rect>
              <circle cx="12" cy="13" r="3"></circle>
              <path d="m5 7 2-2"></path>
              <path d="m19 7-2-2"></path>
            </svg>
          </button>
        </>
      )}
    </div>
  );
};

export default WebcamView;
