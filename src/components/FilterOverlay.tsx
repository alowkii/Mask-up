import React, { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import { Filter } from "../types/Filter";

interface FilterOverlayProps {
  detections:
    | faceapi.WithFaceLandmarks<
        { detection: faceapi.FaceDetection },
        faceapi.FaceLandmarks68
      >[]
    | null;
  videoElement: HTMLVideoElement | null;
  selectedFilters: Filter[];
  className?: string;
}

const FilterOverlay: React.FC<FilterOverlayProps> = ({
  detections,
  videoElement,
  selectedFilters,
  className = "",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const filterImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());

  // Preload filter images
  useEffect(() => {
    const loadFilterImages = async () => {
      const loadImage = (filter: Filter): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = filter.image;
        });
      };

      try {
        // Load all filter images in parallel
        const imagePromises = selectedFilters.map(async (filter) => {
          // Skip if already loaded
          if (filterImagesRef.current.has(filter.id)) return;

          const img = await loadImage(filter);
          filterImagesRef.current.set(filter.id, img);
        });

        await Promise.all(imagePromises);
      } catch (error) {
        console.error("Error loading filter images:", error);
      }
    };

    loadFilterImages();
  }, [selectedFilters]);

  // Update canvas dimensions when video dimensions change
  useEffect(() => {
    if (!videoElement) return;

    const updateDimensions = () => {
      setDimensions({
        width: videoElement.videoWidth,
        height: videoElement.videoHeight,
      });
    };

    // Initial update
    if (videoElement.readyState >= 2) {
      updateDimensions();
    }

    // Update when video metadata is loaded
    videoElement.addEventListener("loadedmetadata", updateDimensions);

    return () => {
      videoElement.removeEventListener("loadedmetadata", updateDimensions);
    };
  }, [videoElement]);

  // Draw filters on canvas
  useEffect(() => {
    if (
      !canvasRef.current ||
      !videoElement ||
      !detections ||
      !detections.length
    )
      return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw each filter for each detected face
    detections.forEach((detection) => {
      selectedFilters.forEach((filter) => {
        const img = filterImagesRef.current.get(filter.id);
        if (!img) return;

        // Calculate filter position based on face landmarks
        const position = filter.position(detection.landmarks, detection);

        // Draw filter on canvas
        ctx.save();

        // Apply rotation if specified
        if (position.angle) {
          ctx.translate(
            position.x + position.width / 2,
            position.y + position.height / 2
          );
          ctx.rotate((position.angle * Math.PI) / 180);
          ctx.translate(
            -(position.x + position.width / 2),
            -(position.y + position.height / 2)
          );
        }

        // Draw image
        ctx.drawImage(
          img,
          position.x,
          position.y,
          position.width,
          position.height
        );

        ctx.restore();
      });
    });
  }, [detections, selectedFilters, videoElement]);

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      className={`absolute top-0 left-0 w-full h-full ${className}`}
    />
  );
};

export default FilterOverlay;
