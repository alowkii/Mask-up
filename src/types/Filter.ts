export interface FilterPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  angle?: number;
}

export interface Filter {
  id: string;
  name: string;
  image: string;
  category: "face" | "eyes" | "mouth" | "head";
  position: (landmarks: any, detection: any) => FilterPosition;
}
