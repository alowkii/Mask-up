export interface AppError extends Error {
  code?: string;
  context?: Record<string, any>;
  isFatal?: boolean;
  recoveryAction?: () => void;
}

export const createAppError = (
  message: string,
  options: {
    code?: string;
    context?: Record<string, any>;
    isFatal?: boolean;
    recoveryAction?: () => void;
    originalError?: Error;
  } = {}
): AppError => {
  const error = new Error(message) as AppError;
  error.name = options.code ? `AppError[${options.code}]` : "AppError";
  error.code = options.code;
  error.context = options.context;
  error.isFatal = options.isFatal;
  error.recoveryAction = options.recoveryAction;
  error.stack = options.originalError
    ? options.originalError.stack
    : error.stack;
  return error;
};

// Error codes
export const ERROR_CODES = {
  WEBCAM_ACCESS_DENIED: "WEBCAM_ACCESS_DENIED",
  WEBCAM_DEVICE_NOT_FOUND: "WEBCAM_DEVICE_NOT_FOUND",
  WEBCAM_GENERIC: "WEBCAM_GENERIC",
  MODEL_LOAD_FAILED: "MODEL_LOAD_FAILED",
  MODEL_NETWORK_ERROR: "MODEL_NETWORK_ERROR",
  MODEL_CORRUPTED: "MODEL_CORRUPTED",
  BROWSER_UNSUPPORTED: "BROWSER_UNSUPPORTED",
  DETECTION_FAILED: "DETECTION_FAILED",
  SCREENSHOT_FAILED: "SCREENSHOT_FAILED",
  FILTER_LOAD_FAILED: "FILTER_LOAD_FAILED",
  PERFORMANCE_ISSUE: "PERFORMANCE_ISSUE",
};

// Recovery actions
export const getRecoveryAction = (
  errorCode: string
): (() => void) | undefined => {
  switch (errorCode) {
    case ERROR_CODES.WEBCAM_ACCESS_DENIED:
      return () => {
        window.location.reload();
        alert("Please allow camera access when prompted");
      };

    case ERROR_CODES.MODEL_NETWORK_ERROR:
      return () => window.location.reload();

    case ERROR_CODES.PERFORMANCE_ISSUE:
      return () => {
        localStorage.setItem("lowPerformanceMode", "true");
        window.location.reload();
      };

    default:
      return undefined;
  }
};

// Error diagnostics
export const diagnoseWebcamError = (error: Error): AppError => {
  // Convert DOMException and other browser errors to our AppError format
  const message = error.message.toLowerCase();

  if (
    message.includes("permission denied") ||
    message.includes("not allowed")
  ) {
    return createAppError(
      "Camera access was denied. Please allow camera access to use this app.",
      {
        code: ERROR_CODES.WEBCAM_ACCESS_DENIED,
        recoveryAction: getRecoveryAction(ERROR_CODES.WEBCAM_ACCESS_DENIED),
        originalError: error,
      }
    );
  }

  if (message.includes("device not found") || message.includes("unavailable")) {
    return createAppError("No camera was found on your device.", {
      code: ERROR_CODES.WEBCAM_DEVICE_NOT_FOUND,
      originalError: error,
    });
  }

  return createAppError("An error occurred accessing your camera.", {
    code: ERROR_CODES.WEBCAM_GENERIC,
    originalError: error,
  });
};

export const diagnoseModelError = (error: Error): AppError => {
  const message = error.message.toLowerCase();

  if (
    message.includes("network") ||
    message.includes("fetch") ||
    message.includes("download")
  ) {
    return createAppError(
      "Failed to download face detection models. Please check your internet connection.",
      {
        code: ERROR_CODES.MODEL_NETWORK_ERROR,
        recoveryAction: getRecoveryAction(ERROR_CODES.MODEL_NETWORK_ERROR),
        originalError: error,
      }
    );
  }

  if (
    message.includes("parse") ||
    message.includes("corrupt") ||
    message.includes("invalid")
  ) {
    return createAppError(
      "The face detection models appear to be corrupted. Please clear your browser cache and reload.",
      {
        code: ERROR_CODES.MODEL_CORRUPTED,
        originalError: error,
      }
    );
  }

  return createAppError("Failed to load face detection models.", {
    code: ERROR_CODES.MODEL_LOAD_FAILED,
    originalError: error,
  });
};

// Logger for app errors
export const logError = (
  error: Error | AppError,
  additionalInfo?: Record<string, any>
) => {
  // In a real app, you might send this to a logging service
  console.error("App Error:", {
    message: error.message,
    name: error.name,
    code: (error as AppError).code,
    stack: error.stack,
    context: (error as AppError).context,
    additionalInfo,
  });
};
