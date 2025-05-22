import React, { useState, useEffect, useRef, useCallback } from "react";
import WebcamView from "./WebcamView";
import Filter3DOverlay from "./Filter3DOverlay";
import FilterSelector from "./FilterSelector";
import ControlPanel from "./ControlPanel";
import FilterCalibration from "./FilterCalibration";
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
  const [renderMode, setRenderMode] = useState<"2d" | "3d">("3d");
  const [isCalibrationOpen, setIsCalibrationOpen] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [positionAdjustments, setPositionAdjustments] = useState<
    Record<string, any>
  >({});

  const mainContainerRef = useRef<HTMLDivElement>(null);
  const filter3DCanvasRef = useRef<HTMLCanvasElement>(null);

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
    filename: "ar-face-filter-3d",
    onScreenshotTaken: (dataUrl) => {
      console.log("📸 3D Screenshot taken successfully");

      // Show flash effect
      if (mainContainerRef.current) {
        mainContainerRef.current.classList.add("screenshot-flash");
        setTimeout(() => {
          mainContainerRef.current?.classList.remove("screenshot-flash");
        }, 300);
      }

      // Download the image
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `ar-face-filter-3d-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    },
    onError: (error) => {
      console.error("Screenshot error:", error);
      alert("Failed to take screenshot. Please try again.");
    },
  });

  // Set element ref
  useEffect(() => {
    if (mainContainerRef.current) {
      setElementRef(mainContainerRef.current);
    }
  }, [setElementRef]);

  // Handle webcam video element ready
  const handleVideoReady = useCallback((element: HTMLVideoElement) => {
    console.log("📹 Video element ready for 3D AR:", element);
    setVideoElement(element);
  }, []);

  // Toggle filter selection
  const handleFilterToggle = useCallback((filter: Filter) => {
    setSelectedFilters((prev) => {
      const isSelected = prev.some((f) => f.id === filter.id);
      if (isSelected) {
        console.log(`🔄 Removing 3D filter: ${filter.name}`);
        return prev.filter((f) => f.id !== filter.id);
      } else {
        console.log(`✅ Adding 3D filter: ${filter.name}`);
        return [...prev, filter];
      }
    });
  }, []);

  // Handle position adjustments from calibration
  const handlePositionChange = useCallback(
    (filterId: string, adjustments: any) => {
      setPositionAdjustments((prev) => ({
        ...prev,
        [filterId]: adjustments,
      }));
    },
    []
  );

  // Enhanced screenshot for 3D
  const handleScreenshot = useCallback(async () => {
    console.log("📸 Taking 3D AR screenshot...");

    try {
      if (!videoElement) {
        throw new Error("No video available for screenshot");
      }

      if (videoElement.readyState < 2) {
        throw new Error("Video not ready. Please wait a moment and try again.");
      }

      await takeScreenshot(videoElement, filter3DCanvasRef.current);
    } catch (error) {
      console.error("3D Screenshot failed:", error);
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      alert(`Screenshot failed: ${message}`);
    }
  }, [takeScreenshot, videoElement]);

  // Toggle between 2D and 3D modes
  const handleRenderModeToggle = useCallback(() => {
    setRenderMode((prev) => (prev === "2d" ? "3d" : "2d"));
  }, []);

  // Toggle debug mode
  const handleDebugToggle = useCallback(() => {
    setDebugMode((prev) => !prev);
  }, []);

  // Export calibration settings
  const exportCalibrationSettings = useCallback(() => {
    const settings = {
      positionAdjustments,
      timestamp: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "filter-calibration-settings.json";
    link.click();

    URL.revokeObjectURL(url);
  }, [positionAdjustments]);

  // Check browser compatibility
  useEffect(() => {
    const compatibility = checkBrowserCompatibility();
    console.log("🌐 Browser compatibility check for 3D AR:", compatibility);

    // Additional WebGL check for 3D rendering
    const canvas = document.createElement("canvas");
    const webglSupported = !!(
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
    );

    if (!compatibility.supported || !webglSupported) {
      setIsCompatible(false);
      setError(
        new Error(
          "Your browser does not support WebGL or other features needed for 3D AR."
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

  if (error || !isCompatible) {
    return <ErrorFallback error={error} />;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col relative overflow-hidden">
      <header className="bg-white shadow-sm p-2 z-10">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              3D AR Face Filter
            </h1>
            <div className="text-sm text-gray-500 mt-1">
              {isModelLoading && "Loading face detection models..."}
              {isModelLoaded && !videoElement && "Waiting for camera..."}
              {isModelLoaded &&
                videoElement &&
                `Ready for ${renderMode.toUpperCase()} AR`}
            </div>
          </div>

          {/* Control buttons */}
          <div className="flex gap-2">
            {/* Debug Mode Toggle */}
            <button
              onClick={handleDebugToggle}
              className={`px-2 py-1 rounded text-sm transition-colors ${
                debugMode
                  ? "bg-red-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
              title="Toggle debug mode"
            >
              🐛
            </button>

            {/* Export Settings */}
            {Object.keys(positionAdjustments).length > 0 && (
              <button
                onClick={exportCalibrationSettings}
                className="px-2 py-1 rounded text-sm bg-green-500 text-white"
                title="Export calibration settings"
              >
                💾
              </button>
            )}

            {/* 2D/3D Mode Toggle */}
            <button
              onClick={handleRenderModeToggle}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                renderMode === "3d"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {renderMode === "3d" ? "3D Mode" : "2D Mode"}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col relative" ref={mainContainerRef}>
        {/* Webcam View with 3D Filter Overlay */}
        <div className="flex-1 relative">
          <WebcamView
            onVideoReady={handleVideoReady}
            className="w-full h-full"
            mirrored={true}
          />

          {/* 3D Filter Overlay */}
          {videoElement && isModelLoaded && renderMode === "3d" && (
            <Filter3DOverlay
              ref={filter3DCanvasRef}
              detections={detections}
              videoElement={videoElement}
              selectedFilters={selectedFilters}
              debug={debugMode}
              positionAdjustments={positionAdjustments}
            />
          )}

          {/* Loading indicator */}
          {isModelLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 z-20">
              <div className="text-white text-center p-4">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
                <p>Loading 3D AR models...</p>
                <p className="text-sm text-gray-300 mt-2">
                  Initializing WebGL and face detection...
                </p>
              </div>
            </div>
          )}

          {/* Status indicators */}
          <div className="absolute top-4 right-4 space-y-2">
            {renderMode === "3d" && videoElement && isModelLoaded && (
              <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs">
                3D AR Active
              </div>
            )}

            {debugMode && (
              <div className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                Debug Mode
              </div>
            )}

            {detections && detections.length > 0 && (
              <div className="bg-green-500 text-white px-2 py-1 rounded text-xs">
                {detections.length} Face{detections.length > 1 ? "s" : ""}{" "}
                Detected
              </div>
            )}
          </div>
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

        {/* Calibration Panel */}
        <FilterCalibration
          onPositionChange={handlePositionChange}
          selectedFilters={selectedFilters}
          isVisible={isCalibrationOpen}
          onToggle={() => setIsCalibrationOpen((prev) => !prev)}
        />
      </main>
    </div>
  );
};

export default App;
