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
  isVideoMirrored?: boolean;
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
      isVideoMirrored = true,
    },
    ref
  ) => {
    const mountRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
    const filtersRef = useRef<Map<string, THREE.Group>>(new Map());
    const debugGroupRef = useRef<THREE.Group | null>(null);
    const animationRef = useRef<number>(0);
    const [dimensions, setDimensions] = useState({
      width: 0,
      height: 0,
      videoWidth: 0,
      videoHeight: 0,
    });

    // Expose canvas ref to parent component
    useImperativeHandle(ref, () => canvasRef.current!, []);

    // Initialize Three.js scene with orthographic camera for better 2D overlay
    useEffect(() => {
      if (
        !mountRef.current ||
        dimensions.width === 0 ||
        dimensions.height === 0
      )
        return;

      // Scene setup
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // Use orthographic camera for better 2D positioning
      const aspect = dimensions.width / dimensions.height;
      const frustumSize = 2;
      const camera = new THREE.OrthographicCamera(
        (-frustumSize * aspect) / 2, // left
        (frustumSize * aspect) / 2, // right
        frustumSize / 2, // top
        -frustumSize / 2, // bottom
        0.1, // near
        10 // far
      );
      camera.position.set(0, 0, 1);
      camera.lookAt(0, 0, 0);
      cameraRef.current = camera;

      // Renderer setup
      const renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true,
      });
      renderer.setSize(dimensions.width, dimensions.height);
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
        if (
          mountRef.current &&
          renderer.domElement &&
          mountRef.current.contains(renderer.domElement)
        ) {
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
        // Use the video's actual video dimensions for face detection coordinate mapping
        const videoWidth = videoElement.videoWidth;
        const videoHeight = videoElement.videoHeight;

        // Use the displayed dimensions for canvas sizing
        const rect = videoElement.getBoundingClientRect();
        const displayWidth = rect.width;
        const displayHeight = rect.height;

        if (
          videoWidth > 0 &&
          videoHeight > 0 &&
          displayWidth > 0 &&
          displayHeight > 0
        ) {
          setDimensions({
            width: displayWidth,
            height: displayHeight,
            videoWidth,
            videoHeight,
          });
          console.log("Updated dimensions:", {
            display: { width: displayWidth, height: displayHeight },
            video: { width: videoWidth, height: videoHeight },
          });
        }
      };

      // Update dimensions immediately if video is ready
      if (videoElement.readyState >= 2) {
        updateDimensions();
      }

      // Listen for video metadata changes
      videoElement.addEventListener("loadedmetadata", updateDimensions);

      // Also listen for resize events
      const resizeObserver = new ResizeObserver(updateDimensions);
      resizeObserver.observe(videoElement);

      return () => {
        videoElement.removeEventListener("loadedmetadata", updateDimensions);
        resizeObserver.disconnect();
      };
    }, [videoElement]);

    // Update camera when dimensions change
    useEffect(() => {
      if (rendererRef.current && cameraRef.current && dimensions.width > 0) {
        const renderer = rendererRef.current;
        const camera = cameraRef.current;

        renderer.setSize(dimensions.width, dimensions.height);

        // Update orthographic camera
        const aspect = dimensions.width / dimensions.height;
        const frustumSize = 2;
        camera.left = (-frustumSize * aspect) / 2;
        camera.right = (frustumSize * aspect) / 2;
        camera.top = frustumSize / 2;
        camera.bottom = -frustumSize / 2;
        camera.updateProjectionMatrix();
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

    // Improved face-to-3D coordinate mapping with proper 3D rotation
    const mapFaceTo3D = (
      landmarks: faceapi.FaceLandmarks68,
      detection: any
    ) => {
      const box = detection.detection.box;
      const positions = landmarks.positions;

      // Get key landmark points
      const leftEye = landmarks.getLeftEye()[0];
      const rightEye = landmarks.getRightEye()[3];
      const noseTip = landmarks.getNose()[3];
      const noseTop = landmarks.getNose()[0];
      const chin = landmarks.getJawOutline()[8];
      const forehead = positions[24];
      const leftJaw = landmarks.getJawOutline()[0];
      const rightJaw = landmarks.getJawOutline()[16];

      // Check if video is mirrored
      const isVideoMirroredState =
        isVideoMirrored ??
        (videoElement?.style.transform.includes("scaleX(-1)") || false);

      // Use video dimensions for face detection coordinates
      const videoWidth = dimensions.videoWidth || dimensions.width;
      const videoHeight = dimensions.videoHeight || dimensions.height;

      // Convert face center to normalized coordinates
      const faceCenterX = (noseTip.x / videoWidth) * 2 - 1;
      const faceCenterY = -((noseTip.y / videoHeight) * 2 - 1); // Flip Y

      // Calculate face dimensions for better scaling
      const faceWidth = Math.abs(rightEye.x - leftEye.x);
      const faceHeight = Math.abs(chin.y - forehead.y);
      const jawWidth = Math.abs(rightJaw.x - leftJaw.x);

      // Improved scale calculation - use face width as primary reference
      const baseScale = faceWidth / 200; // More intuitive scaling based on face width

      // Calculate 3D rotations

      // 1. Roll (Z-axis) - Head tilt left/right
      let rollAngle = Math.atan2(
        rightEye.y - leftEye.y,
        rightEye.x - leftEye.x
      );
      if (isVideoMirroredState) {
        rollAngle = -rollAngle;
      }

      // 2. Yaw (Y-axis) - Head turn left/right
      // Estimate from face symmetry and eye positions
      const eyeCenter = (leftEye.x + rightEye.x) / 2;
      const faceCenter = noseTip.x;
      const jawCenter = (leftJaw.x + rightJaw.x) / 2;

      // Calculate asymmetry to estimate head turn
      const faceAsymmetry = (eyeCenter - faceCenter) / faceWidth;
      const jawAsymmetry = (jawCenter - faceCenter) / jawWidth;
      const avgAsymmetry = (faceAsymmetry + jawAsymmetry) / 2;

      let yawAngle = avgAsymmetry * Math.PI * 0.3; // Max 54 degrees
      if (isVideoMirroredState) {
        yawAngle = -yawAngle;
      }

      // 3. Pitch (X-axis) - Head nod up/down
      // Estimate from nose position relative to eye line
      const eyeLineY = (leftEye.y + rightEye.y) / 2;
      const noseOffsetY = noseTip.y - eyeLineY;
      const normalNoseOffset = faceHeight * 0.3; // Normal nose position below eyes

      const pitchFactor = (noseOffsetY - normalNoseOffset) / faceHeight;
      const pitchAngle = pitchFactor * Math.PI * 0.2; // Max 36 degrees

      return {
        center: {
          x: faceCenterX,
          y: faceCenterY,
          z: 0,
        },
        scale: baseScale,
        rotation: {
          x: pitchAngle, // Pitch (nod up/down)
          y: yawAngle, // Yaw (turn left/right)
          z: rollAngle, // Roll (tilt left/right)
        },
        landmarks: {
          leftEye,
          rightEye,
          noseTip,
          noseTop,
          chin,
          forehead,
          leftJaw,
          rightJaw,
          faceWidth,
          faceHeight,
          jawWidth,
        },
        isVideoMirrored: isVideoMirroredState,
        videoWidth,
        videoHeight,
      };
    };

    // Get specific position for each filter type with proper scaling
    const getFilterPosition = (filterId: string, faceData: any) => {
      const { center, scale, rotation, landmarks, videoWidth, videoHeight } =
        faceData;

      switch (filterId) {
        case "glasses":
          // Position at eye level using video coordinates
          const eyeCenterX = (landmarks.leftEye.x + landmarks.rightEye.x) / 2;
          const eyeCenterY = (landmarks.leftEye.y + landmarks.rightEye.y) / 2;

          const glassesX = (eyeCenterX / videoWidth) * 2 - 1;
          const glassesY = -((eyeCenterY / videoHeight) * 2 - 1);

          return {
            x: glassesX,
            y: glassesY,
            z: 0.01,
            scale: scale * 0.8, // Proportional to face width
            rotation: rotation,
          };

        case "hat":
          // Position above forehead
          const hatY = landmarks.forehead.y - landmarks.faceHeight * 0.6;
          return {
            x: center.x,
            y: -((hatY / videoHeight) * 2 - 1),
            z: -0.02,
            scale: scale * 1.2, // Larger for hat
            rotation: rotation,
          };

        case "beard":
          // Position below mouth area
          const beardY = landmarks.chin.y + landmarks.faceHeight * 0.05;
          return {
            x: center.x,
            y: -((beardY / videoHeight) * 2 - 1),
            z: 0.01,
            scale: scale * 1.0, // Similar to face width
            rotation: rotation,
          };

        case "mustache":
          // Position between nose and mouth
          const mustacheY = landmarks.noseTip.y + landmarks.faceHeight * 0.2;
          return {
            x: center.x,
            y: -((mustacheY / videoHeight) * 2 - 1),
            z: 0.02,
            scale: scale * 0.6, // Smaller mustache
            rotation: rotation,
          };

        default:
          return {
            x: center.x,
            y: center.y,
            z: center.z,
            scale: scale,
            rotation: rotation,
          };
      }
    };

    // Create debug visualization
    const updateDebugVisualization = (faceData: any) => {
      if (!debug || !debugGroupRef.current) return;

      debugGroupRef.current.clear();

      // Face center indicator
      const centerGeometry = new THREE.SphereGeometry(0.05, 8, 8);
      const centerMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
      const centerSphere = new THREE.Mesh(centerGeometry, centerMaterial);
      centerSphere.position.set(faceData.center.x, faceData.center.y, 0);
      debugGroupRef.current.add(centerSphere);

      // Log debug info
      console.log("Face Debug:", {
        center: faceData.center,
        scale: faceData.scale,
        rotation: faceData.rotation,
        dimensions,
      });
    };

    // Animation and rendering loop
    useEffect(() => {
      if (!rendererRef.current || !sceneRef.current || !cameraRef.current)
        return;

      const renderer = rendererRef.current;
      const scene = sceneRef.current;
      const camera = cameraRef.current;

      const animate = () => {
        // Hide all filters first
        filtersRef.current.forEach((filterGroup) => {
          filterGroup.visible = false;
        });

        // Process detections
        if (detections && detections.length > 0) {
          detections.forEach((detection, faceIndex) => {
            if (detection.detection.score < 0.7) return;

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

              // Add subtle animation
              if (filter.id === "hat") {
                const time = Date.now() * 0.001;
                filterGroup.position.y += Math.sin(time) * 0.02;
              }
            });
          });
        }

        renderer.render(scene, camera);
        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);

      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }, [detections, selectedFilters, dimensions, debug, positionAdjustments]);

    return (
      <div
        ref={mountRef}
        className={`absolute inset-0 pointer-events-none ${className}`}
        style={{
          zIndex: 10,
          width: "100%",
          height: "100%",
        }}
      />
    );
  }
);

Filter3DOverlay.displayName = "Filter3DOverlay";

export default Filter3DOverlay;
