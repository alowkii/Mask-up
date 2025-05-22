export interface FilterPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  angle?: number;
}

export interface Filter3DPosition {
  x: number;
  y: number;
  z: number;
  scale: number;
  rotationX?: number;
  rotationY?: number;
  rotationZ?: number;
}

export interface Filter {
  id: string;
  name: string;
  image: string; // Keep for backwards compatibility and thumbnails
  category: "face" | "eyes" | "mouth" | "head";
  type: "2d" | "3d"; // New field to specify filter type
  position: (landmarks: any, detection: any) => FilterPosition;
  position3D?: (landmarks: any, detection: any) => Filter3DPosition; // Optional 3D positioning
  modelType?: "glasses" | "hat" | "beard" | "mustache"; // For 3D model selection
}
