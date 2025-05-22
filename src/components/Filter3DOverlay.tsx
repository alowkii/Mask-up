import React, {
  useRef,
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import * as THREE from "three";
import * as faceapi from "face-api.js";
import { Filter } from "../types/Filter";
import { FilterModels } from "../utils/FilterModels";

interface Filter3DOverlayProps {
  detections:
    | faceapi.WithFaceLandmarks<
        { detection: faceapi.FaceDetection },
        faceapi.FaceLandmarks68
      >[]
    | null;
  videoElement: HTMLVideoElement | null;
  selectedFilters: Filter[];
  className?: string;
  debug?: boolean;
  positionAdjustments?: Record<string, any>;
}

const Filter3DOverlay = forwardRef<HTMLCanvasElement, Filter3DOverlayProps>(
  (
    {
      detections,
      videoElement,
      selectedFilters,
      className = "",
      debug = false,
      positionAdjustments = {},
    },
    ref
  ) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const filtersRef = useRef<Map<string, THREE.Group>>(new Map());
    const debugGroupRef = useRef<THREE.Group | null>(null);
    const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

    // Expose canvas ref to parent component
    useImperativeHandle(ref, () => canvasRef.current!, []);

    // Initialize Three.js scene
    useEffect(() => {
      if (!mountRef.current) return;

      // Scene setup
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // Camera setup with proper FOV matching typical webcam
      const camera = new THREE.PerspectiveCamera(
        60, // Reduced FOV for better face tracking
        dimensions.width / dimensions.height || 1,
        0.1, // Near
        100 // Far
      );
      camera.position.set(0, 0, 2); // Moved camera further back
      cameraRef.current = camera;

      // Renderer setup
      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true,
      });
      renderer.setSize(dimensions.width || 640, dimensions.height || 480);
      renderer.setClearColor(0x000000, 0); // Transparent background
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      rendererRef.current = renderer;

      // Add lighting
      const lights = FilterModels.createLighting();
      lights.forEach((light) => scene.add(light));

      // Debug helpers
      if (debug) {
        const debugGroup = new THREE.Group();
        debugGroupRef.current = debugGroup;
        scene.add(debugGroup);
      }

      // Mount canvas
      if (mountRef.current) {
        mountRef.current.appendChild(renderer.domElement);
        canvasRef.current = renderer.domElement;
      }

      return () => {
        if (mountRef.current && renderer.domElement) {
          mountRef.current.removeChild(renderer.domElement);
        }
        renderer.dispose();
        scene.clear();
      };
    }, [dimensions, debug]);

    // Update dimensions when video changes
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

      if (videoElement.readyState >= 2) {
        updateDimensions();
      }

      videoElement.addEventListener("loadedmetadata", updateDimensions);
      return () => {
        videoElement.removeEventListener("loadedmetadata", updateDimensions);
      };
    }, [videoElement]);

    // Update renderer size when dimensions change
    useEffect(() => {
      if (rendererRef.current && cameraRef.current && dimensions.width > 0) {
        rendererRef.current.setSize(dimensions.width, dimensions.height);
        cameraRef.current.aspect = dimensions.width / dimensions.height;
        cameraRef.current.updateProjectionMatrix();
      }
    }, [dimensions]);

    // Create and manage 3D filter models
    useEffect(() => {
      if (!sceneRef.current) return;

      const scene = sceneRef.current;

      // Remove old filters
      filtersRef.current.forEach((filterGroup, filterId) => {
        if (!selectedFilters.some((f) => f.id === filterId)) {
          scene.remove(filterGroup);
          filtersRef.current.delete(filterId);
        }
      });

      // Add new filters
      selectedFilters.forEach((filter) => {
        if (!filtersRef.current.has(filter.id)) {
          let filterModel: THREE.Group;

          switch (filter.id) {
            case "glasses":
              filterModel = FilterModels.createGlasses();
              break;
            case "hat":
              filterModel = FilterModels.createHat();
              break;
            case "beard":
              filterModel = FilterModels.createBeard();
              break;
            case "mustache":
              filterModel = FilterModels.createMustache();
              break;
            default:
              return;
          }

          filterModel.visible = false;
          scene.add(filterModel);
          filtersRef.current.set(filter.id, filterModel);
        }
      });
    }, [selectedFilters]);

    // Improved face-to-3D coordinate mapping
    const mapFaceTo3D = (
      landmarks: faceapi.FaceLandmarks68,
      detection: any
    ) => {
      const box = detection.detection.box;
      const positions = landmarks.positions;

      // Get key landmark points
      const leftEye = landmarks.getLeftEye()[0]; // Left eye outer corner
      const rightEye = landmarks.getRightEye()[3]; // Right eye outer corner
      const noseTip = landmarks.getNose()[3]; // Nose tip
      const chin = landmarks.getJawOutline()[8]; // Chin center
      const forehead = positions[24]; // Forehead center

      // Calculate face center (use nose tip as primary reference)
      const faceCenterX = noseTip.x;
      const faceCenterY = noseTip.y;

      // Convert to normalized coordinates [-1, 1]
      const normalizedX = (faceCenterX / dimensions.width) * 2 - 1;
      const normalizedY = -((faceCenterY / dimensions.height) * 2 - 1); // Flip Y axis

      // Calculate face dimensions for scaling
      const faceWidth = Math.abs(rightEye.x - leftEye.x);
      const faceHeight = Math.abs(chin.y - forehead.y);
      const avgFaceSize = (faceWidth + faceHeight) / 2;

      // Scale factor - adjust this to make filters larger/smaller
      const baseScale = avgFaceSize / 150; // Reduced from 200 to make filters smaller

      // Calculate face rotation (roll - head tilt left/right)
      const eyeAngle = Math.atan2(
        rightEye.y - leftEye.y,
        rightEye.x - leftEye.x
      );

      // Estimate face orientation (simplified)
      const eyeDistance = Math.abs(rightEye.x - leftEye.x);
      const expectedEyeDistance = faceWidth * 0.35; // Typical eye distance ratio
      const depthFactor = eyeDistance / expectedEyeDistance;

      // Calculate yaw (head turn left/right) - simplified estimation
      const faceCenter = (leftEye.x + rightEye.x) / 2;
      const faceCenterNormalized = faceCenter / dimensions.width;
      const yawAngle = (faceCenterNormalized - 0.5) * 0.5; // Max 30 degrees

      return {
        position: {
          x: normalizedX,
          y: normalizedY,
          z: 0,
        },
        scale: baseScale,
        rotation: {
          x: 0,
          y: yawAngle,
          z: eyeAngle,
        },
        landmarks: {
          leftEye,
          rightEye,
          noseTip,
          chin,
          forehead,
          faceWidth,
          faceHeight,
        },
      };
    };

    // Get specific position for each filter type
    const getFilterPosition = (filterId: string, faceData: any) => {
      const { position, scale, rotation, landmarks } = faceData;

      switch (filterId) {
        case "glasses":
          // Position between the eyes
          const eyeCenterX = (landmarks.leftEye.x + landmarks.rightEye.x) / 2;
          const eyeCenterY = (landmarks.leftEye.y + landmarks.rightEye.y) / 2;
          return {
            x: (eyeCenterX / dimensions.width) * 2 - 1,
            y: -((eyeCenterY / dimensions.height) * 2 - 1),
            z: 0.02,
            scale: scale * 1.2,
            rotation: { ...rotation, x: -0.1 }, // Slight downward tilt
          };

        case "hat":
          // Position above the forehead
          return {
            x: position.x,
            y: position.y + (landmarks.faceHeight / dimensions.height) * 1.2,
            z: -0.05,
            scale: scale * 1.8,
            rotation: rotation,
          };

        case "beard":
          // Position below the mouth, above the chin
          return {
            x: position.x,
            y: position.y - (landmarks.faceHeight / dimensions.height) * 0.6,
            z: 0.01,
            scale: scale * 1.4,
            rotation: rotation,
          };

        case "mustache":
          // Position between nose and upper lip
          const noseToMouthY =
            landmarks.noseTip.y + landmarks.faceHeight * 0.15;
          return {
            x: position.x,
            y: -((noseToMouthY / dimensions.height) * 2 - 1),
            z: 0.03,
            scale: scale * 0.8,
            rotation: rotation,
          };

        default:
          return {
            x: position.x,
            y: position.y,
            z: position.z,
            scale: scale,
            rotation: rotation,
          };
      }
    };

    // Create debug visualization
    const updateDebugVisualization = (faceData: any) => {
      if (!debug || !debugGroupRef.current) return;

      // Clear previous debug objects
      debugGroupRef.current.clear();

      // Create coordinate system helper
      const axesHelper = new THREE.AxesHelper(0.5);
      debugGroupRef.current.add(axesHelper);

      // Create face center indicator
      const centerGeometry = new THREE.SphereGeometry(0.02, 8, 8);
      const centerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const centerSphere = new THREE.Mesh(centerGeometry, centerMaterial);
      centerSphere.position.set(
        faceData.position.x,
        faceData.position.y,
        faceData.position.z
      );
      debugGroupRef.current.add(centerSphere);

      // Add text helper
      console.log("Face Debug Info:", {
        position: faceData.position,
        scale: faceData.scale,
        rotation: faceData.rotation,
        faceWidth: faceData.landmarks.faceWidth,
        faceHeight: faceData.landmarks.faceHeight,
      });
    };

    // Update filter positions and render
    useEffect(() => {
      if (
        !rendererRef.current ||
        !sceneRef.current ||
        !cameraRef.current ||
        !detections ||
        !detections.length
      ) {
        // Render empty scene if no detections
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          filtersRef.current.forEach((filterGroup) => {
            filterGroup.visible = false;
          });
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
        return;
      }

      const scene = sceneRef.current;
      const renderer = rendererRef.current;
      const camera = cameraRef.current;

      // Hide all filters first
      filtersRef.current.forEach((filterGroup) => {
        filterGroup.visible = false;
      });

      // Process each detected face
      detections.forEach((detection, faceIndex) => {
        if (!detection.detection || detection.detection.score < 0.7) return;

        const faceData = mapFaceTo3D(detection.landmarks, detection);

        // Update debug visualization for first face
        if (faceIndex === 0) {
          updateDebugVisualization(faceData);
        }

        // Position filters for this face
        selectedFilters.forEach((filter) => {
          const filterGroup = filtersRef.current.get(filter.id);
          if (!filterGroup) return;

          const filterPos = getFilterPosition(filter.id, faceData);

          // Apply calibration adjustments
          const adjustments = positionAdjustments[filter.id] || {};
          const finalPosition = {
            x: filterPos.x + (adjustments.x || 0),
            y: filterPos.y + (adjustments.y || 0),
            z: filterPos.z + (adjustments.z || 0),
            scale: filterPos.scale * (adjustments.scale || 1),
            rotation: {
              x: (filterPos.rotation.x || 0) + (adjustments.rotX || 0),
              y: (filterPos.rotation.y || 0) + (adjustments.rotY || 0),
              z: (filterPos.rotation.z || 0) + (adjustments.rotZ || 0),
            },
          };

          // Apply transformations
          filterGroup.position.set(
            finalPosition.x,
            finalPosition.y,
            finalPosition.z
          );
          filterGroup.rotation.set(
            finalPosition.rotation.x,
            finalPosition.rotation.y,
            finalPosition.rotation.z
          );
          filterGroup.scale.setScalar(finalPosition.scale);
          filterGroup.visible = true;

          // Add subtle breathing animation for hat
          if (filter.id === "hat") {
            const time = Date.now() * 0.002;
            filterGroup.position.y += Math.sin(time) * 0.01;
          }
        });
      });

      // Render the scene
      renderer.render(scene, camera);
    }, [detections, selectedFilters, dimensions, debug]);

    return (
      <div
        ref={mountRef}
        className={`absolute top-0 left-0 w-full h-full pointer-events-none ${className}`}
        style={{ zIndex: 1 }}
      />
    );
  }
);

Filter3DOverlay.displayName = "Filter3DOverlay";

export default Filter3DOverlay;
