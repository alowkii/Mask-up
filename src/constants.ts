import { Filter } from "./types/Filter";

// Model paths
export const MODEL_URL = "/models";

// Model options
export const FACE_DETECTION_OPTIONS = {
  inputSize: 224,
  scoreThreshold: 0.5,
};

// Performance options
export const DETECTION_FREQUENCY = 100;
export const MAX_FACES = 1;
export const MIN_DETECTION_CONFIDENCE = 0.7;

// Canvas rendering
export const CANVAS_SIZE = {
  width: 640,
  height: 480,
};

// Available 3D filters
export const FILTERS: Filter[] = [
  {
    id: "glasses",
    name: "3D Glasses",
    image: "/filters/glasses.svg", // Thumbnail for UI
    category: "eyes",
    type: "3d",
    modelType: "glasses",
    position: (landmarks, detection) => {
      // 2D fallback positioning
      const leftEye = landmarks.getLeftEye();
      const rightEye = landmarks.getRightEye();
      const eyeLeft = leftEye[0];
      const eyeRight = rightEye[3];
      const width = Math.abs(eyeRight.x - eyeLeft.x) * 1.8;

      return {
        x: eyeLeft.x - width * 0.2,
        y: eyeLeft.y - width * 0.25,
        width: width,
        height: width * 0.4,
      };
    },
    position3D: (landmarks, detection) => {
      const leftEye = landmarks.getLeftEye();
      const rightEye = landmarks.getRightEye();
      const box = detection.detection.box;

      // Calculate center between eyes
      const centerX =
        ((leftEye[0].x + rightEye[3].x) / 2 - box.width / 2) / box.width;
      const centerY =
        ((leftEye[0].y + rightEye[3].y) / 2 - box.height / 2) / box.height;

      return {
        x: centerX,
        y: centerY,
        z: 0,
        scale: Math.min(box.width, box.height) / 300,
        rotationZ: Math.atan2(
          rightEye[3].y - leftEye[0].y,
          rightEye[3].x - leftEye[0].x
        ),
      };
    },
  },
  {
    id: "hat",
    name: "3D Hat",
    image: "/filters/hat.svg",
    category: "head",
    type: "3d",
    modelType: "hat",
    position: (landmarks, detection) => {
      const box = detection.detection.box;
      return {
        x: box.x - box.width * 0.15,
        y: box.y - box.height * 0.85,
        width: box.width * 1.3,
        height: box.width * 0.8,
      };
    },
    position3D: (landmarks, detection) => {
      const box = detection.detection.box;
      const forehead = landmarks.positions[24]; // Forehead point

      return {
        x: (forehead.x - box.x - box.width / 2) / box.width,
        y: (forehead.y - box.y - box.height * 0.7) / box.height,
        z: 0,
        scale: Math.min(box.width, box.height) / 250,
      };
    },
  },
  {
    id: "beard",
    name: "3D Beard",
    image: "/filters/beard.svg",
    category: "mouth",
    type: "3d",
    modelType: "beard",
    position: (landmarks, detection) => {
      const jawline = landmarks.getJawOutline();
      const mouth = landmarks.getMouth();
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
    position3D: (landmarks, detection) => {
      const jawline = landmarks.getJawOutline();
      const box = detection.detection.box;
      const chin = jawline[8]; // Chin center

      return {
        x: (chin.x - box.x - box.width / 2) / box.width,
        y: (chin.y - box.y - box.height * 0.3) / box.height,
        z: 0,
        scale: Math.min(box.width, box.height) / 280,
      };
    },
  },
  {
    id: "mustache",
    name: "3D Mustache",
    image: "/filters/mustache.svg",
    category: "mouth",
    type: "3d",
    modelType: "mustache",
    position: (landmarks, detection) => {
      const nose = landmarks.getNose();
      const mouth = landmarks.getMouth();
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
    position3D: (landmarks, detection) => {
      const nose = landmarks.getNose();
      const mouth = landmarks.getMouth();
      const box = detection.detection.box;
      const noseTip = nose[3];
      const upperLip = mouth[14];

      // Position between nose and upper lip
      const centerX = (noseTip.x - box.x - box.width / 2) / box.width;
      const centerY =
        ((noseTip.y + upperLip.y) / 2 - box.y - box.height / 2) / box.height;

      return {
        x: centerX,
        y: centerY,
        z: 0.01, // Slightly forward from face
        scale: Math.min(box.width, box.height) / 400,
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
