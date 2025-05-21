import { useState, useEffect, useRef, useCallback } from "react";
import * as faceapi from "face-api.js";
import {
  FaceDetectionState,
  FaceDetectionResult,
} from "../types/FaceDetection";
import {
  MODEL_URL,
  FACE_DETECTION_OPTIONS,
  DETECTION_FREQUENCY,
  MAX_FACES,
  MIN_DETECTION_CONFIDENCE,
  ERROR_MESSAGES,
} from "../constants";

interface UseFaceDetectionOptions {
  enabled?: boolean;
  videoElement: HTMLVideoElement | null;
  onDetectionComplete?: (result: FaceDetectionResult) => void;
}

export function useFaceDetection({
  enabled = true,
  videoElement,
  onDetectionComplete,
}: UseFaceDetectionOptions): FaceDetectionState {
  const [state, setState] = useState<FaceDetectionState>({
    isModelLoaded: false,
    isModelLoading: false,
    error: null,
    detections: null,
  });

  const detectionInterval = useRef<number | null>(null);
  const isRunningRef = useRef(false);

  // Load face-api.js models
  const loadModels = useCallback(async () => {
    if (state.isModelLoaded || state.isModelLoading) return;

    setState((prev) => ({ ...prev, isModelLoading: true }));

    try {
      console.log("Loading face detection models from:", MODEL_URL);

      // Load models with more detailed error handling
      console.log("Loading tiny face detector...");
      await faceapi.loadTinyFaceDetectorModel(MODEL_URL);

      console.log("Loading face landmarks model...");
      await faceapi.loadFaceLandmarkModel(MODEL_URL);

      console.log("Loading face expression model...");
      await faceapi.loadFaceExpressionModel(MODEL_URL);

      setState((prev) => ({
        ...prev,
        isModelLoaded: true,
        isModelLoading: false,
        error: null,
      }));

      console.log("Face detection models loaded successfully");
    } catch (error) {
      console.error("Error loading face detection models:", error);

      // More specific error message
      let errorMessage = ERROR_MESSAGES.MODEL_LOAD;
      if (error instanceof Error) {
        if (
          error.message.includes("404") ||
          error.message.includes("Not Found")
        ) {
          errorMessage =
            "Face detection model files not found. Please ensure the models are downloaded in the public/models directory.";
        } else if (
          error.message.includes("NetworkError") ||
          error.message.includes("Failed to fetch")
        ) {
          errorMessage =
            "Network error loading models. Please check your internet connection and try again.";
        }
      }

      setState((prev) => ({
        ...prev,
        isModelLoading: false,
        error: new Error(errorMessage),
      }));
    }
  }, [state.isModelLoaded, state.isModelLoading]);

  // Detect faces from video
  const detectFaces = useCallback(async () => {
    if (
      !videoElement ||
      !state.isModelLoaded ||
      !enabled ||
      isRunningRef.current
    )
      return;

    // Skip if video is not ready
    if (videoElement.paused || videoElement.ended || !videoElement.readyState) {
      return;
    }

    isRunningRef.current = true;

    try {
      // Detect faces with landmarks and expressions
      const detections = await faceapi
        .detectAllFaces(
          videoElement,
          new faceapi.TinyFaceDetectorOptions(FACE_DETECTION_OPTIONS)
        )
        .withFaceLandmarks()
        .withFaceExpressions();

      // Filter by confidence and limit to MAX_FACES
      const validDetections = detections
        .filter((d) => d.detection.score > MIN_DETECTION_CONFIDENCE)
        .slice(0, MAX_FACES);

      // Get expressions from the first detected face (if any)
      const expressions =
        validDetections.length > 0 ? validDetections[0].expressions : null;

      setState((prev) => ({
        ...prev,
        detections: validDetections,
        error: null,
      }));

      if (onDetectionComplete) {
        onDetectionComplete({
          detections: validDetections,
          expressions,
        });
      }
    } catch (error) {
      console.error("Face detection error:", error);
    } finally {
      isRunningRef.current = false;
    }
  }, [videoElement, state.isModelLoaded, enabled, onDetectionComplete]);

  // Setup detection interval
  useEffect(() => {
    if (!enabled || !state.isModelLoaded || !videoElement) return;

    const intervalId = setInterval(detectFaces, DETECTION_FREQUENCY);
    detectionInterval.current = intervalId;

    return () => {
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
        detectionInterval.current = null;
      }
    };
  }, [detectFaces, enabled, state.isModelLoaded, videoElement]);

  // Load models when component mounts
  useEffect(() => {
    if (enabled) {
      loadModels();
    }

    return () => {
      if (detectionInterval.current) {
        clearInterval(detectionInterval.current);
        detectionInterval.current = null;
      }
    };
  }, [enabled, loadModels]);

  return state;
}
