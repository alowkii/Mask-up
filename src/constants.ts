import { Filter } from "./types/Filter";

// Model paths - adjust as needed based on your project structure
export const MODEL_URL = "/models";

// Model options
export const FACE_DETECTION_OPTIONS = {
  inputSize: 224,
  scoreThreshold: 0.5,
};

// Performance options
export const DETECTION_FREQUENCY = 100; // ms between detection runs
export const MAX_FACES = 1; // Maximum number of faces to detect at once
export const MIN_DETECTION_CONFIDENCE = 0.7;

// Canvas rendering
export const CANVAS_SIZE = {
  width: 640,
  height: 480,
};

// Available filters
export const FILTERS: Filter[] = [
  {
    id: "glasses",
    name: "Glasses",
    image: "/src/assets/filters/glasses.svg", // Fixed path to .svg
    category: "eyes",
    position: (landmarks, detection) => {
      const leftEye = landmarks.getLeftEye();
      const rightEye = landmarks.getRightEye();

      // Calculate center point between eyes
      const eyeLeft = leftEye[0];
      const eyeRight = rightEye[3];

      // Calculate width based on eye distance
      const width = Math.abs(eyeRight.x - eyeLeft.x) * 1.8;

      return {
        x: eyeLeft.x - width * 0.2,
        y: eyeLeft.y - width * 0.25,
        width: width,
        height: width * 0.4,
      };
    },
  },
  {
    id: "hat",
    name: "Hat",
    image: "/src/assets/filters/hat.svg", // Fixed path to .svg
    category: "head",
    position: (landmarks, detection) => {
      const box = detection.detection.box;

      return {
        x: box.x - box.width * 0.15,
        y: box.y - box.height * 0.85,
        width: box.width * 1.3,
        height: box.width * 0.8,
      };
    },
  },
  {
    id: "beard",
    name: "Beard",
    image: "/src/assets/filters/beard.svg", // Fixed path to .svg
    category: "mouth",
    position: (landmarks, detection) => {
      const jawline = landmarks.getJawOutline();
      const mouth = landmarks.getMouth();

      // Calculate position based on jaw and mouth
      const jawLeft = jawline[0];
      const jawRight = jawline[jawline.length - 1];
      const mouthTop = mouth[14];

      const width = Math.abs(jawRight.x - jawLeft.x) * 1.2;

      return {
        x: jawLeft.x - width * 0.1,
        y: mouthTop.y - width * 0.05,
        width: width,
        height: width * 1.2,
      };
    },
  },
  {
    id: "mustache",
    name: "Mustache",
    image: "/src/assets/filters/moustache.svg", // Fixed path to .svg (note: your file is named "moustache")
    category: "mouth",
    position: (landmarks, detection) => {
      const nose = landmarks.getNose();
      const mouth = landmarks.getMouth();

      // Calculate position based on nose and mouth
      const noseTip = nose[3];
      const mouthTop = mouth[14];

      const width = Math.abs(mouth[0].x - mouth[6].x) * 1.3;

      return {
        x: noseTip.x - width / 2,
        y: noseTip.y * 0.97 + (mouthTop.y - noseTip.y) * 0.35,
        width: width,
        height: width * 0.4,
      };
    },
  },
];

// Error messages
export const ERROR_MESSAGES = {
  WEBCAM_ACCESS:
    "Couldn't access the webcam. Please check your camera permissions.",
  MODEL_LOAD:
    "Failed to load face detection models. Please check your internet connection.",
  BROWSER_SUPPORT:
    "Your browser doesn't support all the features needed for this app.",
  GENERIC: "Something went wrong. Please try refreshing the page.",
};
