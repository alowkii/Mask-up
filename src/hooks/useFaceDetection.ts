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
      await faceapi.loadTinyFaceDetectorModel(MODEL_URL);
      await faceapi.loadFaceLandmarkModel(MODEL_URL);
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
      setState((prev) => ({
        ...prev,
        isModelLoading: false,
        error: new Error(ERROR_MESSAGES.MODEL_LOAD),
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
