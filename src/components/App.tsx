import React, { useState, useEffect, useRef, useCallback } from "react";
import WebcamView from "./WebcamView";
import FilterOverlay from "./FilterOverlay";
import FilterSelector from "./FilterSelector";
import ControlPanel from "./ControlPanel";
import ErrorFallback from "./ErrorFallback";
import { useFaceDetection } from "../hooks/useFaceDetection";
import { useScreenshot } from "../hooks/useScreenshot";
import { checkBrowserCompatibility } from "../utils/browserCompatibility";
import { FILTERS } from "../constants";
import { Filter } from "../types/Filter";
import "../App.css";

const App: React.FC = () => {
  const [videoElement, setVideoElement] = useState<HTMLVideoElement | null>(
    null
  );
  const [isCompatible, setIsCompatible] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Filter[]>([]);
  const mainContainerRef = useRef<HTMLDivElement>(null);

  // Initialize face detection
  const {
    isModelLoaded,
    isModelLoading,
    detections,
    error: detectionError,
  } = useFaceDetection({
    enabled: true,
    videoElement,
  });

  // Initialize screenshot functionality
  const { takeScreenshot, setElementRef } = useScreenshot({
    filename: "ar-face-filter",
    onScreenshotTaken: (dataUrl) => {
      console.log("📸 Screenshot taken successfully");

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
      link.download = `ar-face-filter-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
  });

  // Set element ref when mainContainerRef changes
  useEffect(() => {
    if (mainContainerRef.current) {
      setElementRef(mainContainerRef.current);
    }
  }, [setElementRef]);

  // Handle webcam video element ready
  const handleVideoReady = useCallback((element: HTMLVideoElement) => {
    console.log("📹 Video element ready:", element);
    setVideoElement(element);
  }, []);

  // Toggle filter selection
  const handleFilterToggle = useCallback((filter: Filter) => {
    setSelectedFilters((prev) => {
      const isSelected = prev.some((f) => f.id === filter.id);
      if (isSelected) {
        console.log(`🔄 Removing filter: ${filter.name}`);
        return prev.filter((f) => f.id !== filter.id);
      } else {
        console.log(`✅ Adding filter: ${filter.name}`);
        return [...prev, filter];
      }
    });
  }, []);

  // Handle screenshot button click
  const handleScreenshot = useCallback(() => {
    console.log("📸 Taking screenshot...");
    takeScreenshot();
  }, [takeScreenshot]);

  // Check browser compatibility on mount
  useEffect(() => {
    const compatibility = checkBrowserCompatibility();
    console.log("🌐 Browser compatibility check:", compatibility);

    if (!compatibility.supported) {
      setIsCompatible(false);
      setError(
        new Error(
          "Your browser does not support all the features needed for this app."
        )
      );
    }
  }, []);

  // Handle detection errors
  useEffect(() => {
    if (detectionError) {
      console.error("❌ Face detection error:", detectionError);
      setError(detectionError);
    }
  }, [detectionError]);

  // If there's an error or browser is incompatible, show error component
  if (error || !isCompatible) {
    return <ErrorFallback error={error} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col relative overflow-hidden">
      <header className="bg-white shadow-sm p-4 z-10">
        <h1 className="text-xl font-bold text-gray-800">AR Face Filter</h1>
        <div className="text-sm text-gray-500 mt-1">
          {isModelLoading && "Loading face detection models..."}
          {isModelLoaded && !videoElement && "Waiting for camera..."}
          {isModelLoaded && videoElement && "Ready to detect faces"}
        </div>
      </header>

      <main className="flex-1 flex flex-col relative" ref={mainContainerRef}>
        {/* Webcam View with Filter Overlay */}
        <div className="flex-1 relative">
          <WebcamView
            onVideoReady={handleVideoReady}
            className="w-full h-full"
            mirrored={true}
          />

          {/* Only show filters if we have video element and models are loaded */}
          {videoElement && isModelLoaded && (
            <FilterOverlay
              detections={detections}
              videoElement={videoElement}
              selectedFilters={selectedFilters}
            />
          )}

          {/* Loading indicator for face models */}
          {isModelLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
              <div className="text-white text-center p-4">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
                <p>Loading face detection models...</p>
                <p className="text-sm text-gray-300 mt-2">
                  This may take a moment...
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Filter Selection Panel */}
        <div
          className={`
            absolute bottom-24 left-0 right-0 mx-auto max-w-md z-30
            transform transition-transform duration-300 ease-in-out
            ${isFilterPanelOpen ? "translate-y-0" : "translate-y-full"}
          `}
        >
          <FilterSelector
            filters={FILTERS}
            selectedFilters={selectedFilters}
            onFilterToggle={handleFilterToggle}
            className="mx-4"
          />
        </div>

        {/* Control Panel */}
        <div className="absolute bottom-0 left-0 right-0 p-4 flex justify-center z-30">
          <ControlPanel
            onScreenshot={handleScreenshot}
            onFilterPanelToggle={() => setIsFilterPanelOpen((prev) => !prev)}
            isFilterPanelOpen={isFilterPanelOpen}
            numFiltersSelected={selectedFilters.length}
          />
        </div>
      </main>
    </div>
  );
};

export default App;
