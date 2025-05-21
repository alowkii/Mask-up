import * as faceapi from "face-api.js";

export interface FaceDetectionState {
  isModelLoaded: boolean;
  isModelLoading: boolean;
  error: Error | null;
  detections:
    | faceapi.WithFaceLandmarks<
        { detection: faceapi.FaceDetection },
        faceapi.FaceLandmarks68
      >[]
    | null;
}

export interface FaceDetectionResult {
  detections:
    | faceapi.WithFaceLandmarks<
        { detection: faceapi.FaceDetection },
        faceapi.FaceLandmarks68
      >[]
    | null;
  expressions: faceapi.FaceExpressions | null;
}
