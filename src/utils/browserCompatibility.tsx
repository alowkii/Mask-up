/**
 * Checks if the browser supports all required features
 * @returns Object with support status for each feature
 */
export const checkBrowserCompatibility = (): {
  supported: boolean;
  features: {
    mediaDevices: boolean;
    webgl: boolean;
    canvas2d: boolean;
    webWorker: boolean;
  };
} => {
  // Check for getUserMedia support
  const hasMediaDevices = !!(
    navigator.mediaDevices && navigator.mediaDevices.getUserMedia
  );

  // Check for WebGL support
  let hasWebGL = false;
  try {
    const canvas = document.createElement("canvas");
    hasWebGL = !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch (e) {
    hasWebGL = false;
  }

  // Check for Canvas2D support
  let hasCanvas2d = false;
  try {
    hasCanvas2d = !!document.createElement("canvas").getContext("2d");
  } catch (e) {
    hasCanvas2d = false;
  }

  // Check for Web Workers support
  const hasWebWorker = !!window.Worker;

  // Overall support check
  const isSupported =
    hasMediaDevices && hasWebGL && hasCanvas2d && hasWebWorker;

  return {
    supported: isSupported,
    features: {
      mediaDevices: hasMediaDevices,
      webgl: hasWebGL,
      canvas2d: hasCanvas2d,
      webWorker: hasWebWorker,
    },
  };
};

/**
 * Gets the most suitable camera for face detection
 * @returns Promise resolving to the optimal facing mode
 */
export const getOptimalCamera = async (): Promise<"user" | "environment"> => {
  try {
    // Check if device has multiple cameras
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(
      (device) => device.kind === "videoinput"
    );

    if (videoDevices.length <= 1) {
      // If only one camera, use it
      return "user";
    }

    // Default to front camera for face detection
    return "user";
  } catch (error) {
    console.error("Error detecting cameras:", error);
    // Default to front camera
    return "user";
  }
};
