import * as faceapi from "face-api.js";
import { MODEL_URL, ERROR_MESSAGES } from "../constants";

/**
 * Loads all required face-api.js models
 * @returns Promise that resolves when all models are loaded
 */
export const loadFaceDetectionModels = async (): Promise<void> => {
  try {
    // Start loading all models in parallel
    const modelPromises = [
      faceapi.loadTinyFaceDetectorModel(MODEL_URL),
      faceapi.loadFaceLandmarkModel(MODEL_URL),
      faceapi.loadFaceExpressionModel(MODEL_URL),
    ];

    // Wait for all models to load
    await Promise.all(modelPromises);

    console.log("Face detection models loaded successfully");
  } catch (error) {
    console.error("Error loading face detection models:", error);
    throw new Error(ERROR_MESSAGES.MODEL_LOAD);
  }
};

// src/utils/performanceOptimizer.ts
/**
 * Throttle function to limit how often a function can be called
 * @param callback Function to throttle
 * @param delay Minimum time between function calls (ms)
 */
export const throttle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  let timeoutId: number | null = null;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    const timeSinceLastCall = now - lastCall;

    if (timeSinceLastCall >= delay) {
      // If enough time has passed, call the function immediately
      lastCall = now;
      callback(...args);
    } else if (!timeoutId) {
      // Otherwise, schedule a call after the remaining delay
      const remainingTime = delay - timeSinceLastCall;
      timeoutId = window.setTimeout(() => {
        lastCall = Date.now();
        timeoutId = null;
        callback(...args);
      }, remainingTime);
    }
  };
};

/**
 * Optimizes canvas rendering using requestAnimationFrame
 * @param callback Function to call on each animation frame
 */
export const createAnimationLoop = (
  callback: () => void
): { start: () => void; stop: () => void } => {
  let isRunning = false;
  let animationFrameId: number | null = null;

  const loop = () => {
    if (!isRunning) return;

    callback();
    animationFrameId = requestAnimationFrame(loop);
  };

  return {
    start: () => {
      if (isRunning) return;

      isRunning = true;
      animationFrameId = requestAnimationFrame(loop);
    },
    stop: () => {
      isRunning = false;

      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    },
  };
};

/**
 * Detects if the device has low GPU resources and returns appropriate settings
 */
export const detectPerformanceSettings = (): {
  detectionFrequency: number;
  maxFaces: number;
  inputSize: number;
} => {
  // Check for mobile device using screen size and user agent
  const isMobile =
    window.innerWidth <= 768 ||
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );

  // Check for low-end device (rough estimate)
  const isLowEndDevice =
    navigator.hardwareConcurrency <= 4 || // 4 or fewer CPU cores
    (navigator as any).deviceMemory <= 4; // 4GB or less RAM (non-standard)

  if (isMobile || isLowEndDevice) {
    // Lower settings for mobile/low-end devices
    return {
      detectionFrequency: 250, // Less frequent detections
      maxFaces: 1, // Only detect one face
      inputSize: 160, // Smaller input size
    };
  } else {
    // Higher settings for desktop
    return {
      detectionFrequency: 100,
      maxFaces: 2,
      inputSize: 224,
    };
  }
};
