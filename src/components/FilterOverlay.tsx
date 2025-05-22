import React, {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
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

const FilterOverlay = forwardRef<HTMLCanvasElement, FilterOverlayProps>(
  ({ detections, videoElement, selectedFilters, className = "" }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
    const filterImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());

    // Expose canvas ref to parent component
    useImperativeHandle(ref, () => canvasRef.current!, []);

    // Preload filter images with better error handling
    useEffect(() => {
      const loadFilterImages = async () => {
        const loadImage = (filter: Filter): Promise<HTMLImageElement> => {
          return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = "anonymous"; // Handle CORS
            img.onload = () => {
              console.log(`✅ Loaded filter image: ${filter.name}`);
              resolve(img);
            };
            img.onerror = (error) => {
              console.error(
                `❌ Failed to load filter image: ${filter.name}`,
                error
              );
              reject(new Error(`Failed to load filter: ${filter.name}`));
            };
            img.src = filter.image;
          });
        };

        try {
          // Load all filter images in parallel
          const imagePromises = selectedFilters.map(async (filter) => {
            // Skip if already loaded
            if (filterImagesRef.current.has(filter.id)) return;

            try {
              const img = await loadImage(filter);
              filterImagesRef.current.set(filter.id, img);
            } catch (error) {
              console.error(`Failed to load filter ${filter.name}:`, error);
              // Continue with other filters even if one fails
            }
          });

          await Promise.all(imagePromises);
        } catch (error) {
          console.error("Error loading filter images:", error);
        }
      };

      if (selectedFilters.length > 0) {
        loadFilterImages();
      }
    }, [selectedFilters]);

    // Update canvas dimensions when video dimensions change
    useEffect(() => {
      if (!videoElement) return;

      const updateDimensions = () => {
        const newDimensions = {
          width: videoElement.videoWidth || videoElement.clientWidth,
          height: videoElement.videoHeight || videoElement.clientHeight,
        };

        if (newDimensions.width > 0 && newDimensions.height > 0) {
          setDimensions(newDimensions);
        }
      };

      // Initial update
      if (videoElement.readyState >= 2) {
        updateDimensions();
      }

      // Update when video metadata is loaded
      videoElement.addEventListener("loadedmetadata", updateDimensions);
      videoElement.addEventListener("resize", updateDimensions);

      return () => {
        videoElement.removeEventListener("loadedmetadata", updateDimensions);
        videoElement.removeEventListener("resize", updateDimensions);
      };
    }, [videoElement]);

    // Draw filters on canvas
    useEffect(() => {
      if (
        !canvasRef.current ||
        !videoElement ||
        !detections ||
        !detections.length ||
        dimensions.width === 0 ||
        dimensions.height === 0
      )
        return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate scale factors if canvas and video dimensions differ
      const scaleX = canvas.width / dimensions.width;
      const scaleY = canvas.height / dimensions.height;

      // Draw each filter for each detected face
      detections.forEach((detection) => {
        selectedFilters.forEach((filter) => {
          const img = filterImagesRef.current.get(filter.id);
          if (!img) return;

          try {
            // Calculate filter position based on face landmarks
            const position = filter.position(detection.landmarks, detection);

            // Scale position if necessary
            const scaledPosition = {
              x: position.x * scaleX,
              y: position.y * scaleY,
              width: position.width * scaleX,
              height: position.height * scaleY,
              angle: position.angle,
            };

            // Draw filter on canvas
            ctx.save();

            // Apply rotation if specified
            if (scaledPosition.angle) {
              ctx.translate(
                scaledPosition.x + scaledPosition.width / 2,
                scaledPosition.y + scaledPosition.height / 2
              );
              ctx.rotate((scaledPosition.angle * Math.PI) / 180);
              ctx.translate(
                -(scaledPosition.x + scaledPosition.width / 2),
                -(scaledPosition.y + scaledPosition.height / 2)
              );
            }

            // Draw image
            ctx.drawImage(
              img,
              scaledPosition.x,
              scaledPosition.y,
              scaledPosition.width,
              scaledPosition.height
            );

            ctx.restore();
          } catch (error) {
            console.error(`Error drawing filter ${filter.name}:`, error);
          }
        });
      });
    }, [detections, selectedFilters, videoElement, dimensions]);

    return (
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className={`absolute top-0 left-0 w-full h-full pointer-events-none ${className}`}
        style={{
          imageRendering: "auto",
        }}
      />
    );
  }
);

FilterOverlay.displayName = "FilterOverlay";

export default FilterOverlay;
