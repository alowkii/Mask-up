import React from "react";
import { ERROR_MESSAGES } from "../constants";
import { checkBrowserCompatibility } from "../utils/browserCompatibility";

interface ErrorFallbackProps {
  error: Error | null;
  resetErrorBoundary?: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  resetErrorBoundary,
}) => {
  const compatibility = checkBrowserCompatibility();

  // Determine the most likely cause of the error
  const getBrowserIssues = () => {
    if (!compatibility.supported) {
      const missingFeatures = Object.entries(compatibility.features)
        .filter(([_, supported]) => !supported)
        .map(([feature]) => feature);

      return (
        <div className="mt-4">
          <p className="font-medium">
            Your browser is missing these required features:
          </p>
          <ul className="list-disc list-inside mt-2">
            {missingFeatures.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full">
        <div className="text-red-500 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>

        <h1 className="text-xl font-bold mb-2">Something went wrong</h1>

        <p className="text-gray-700 mb-4">
          {error?.message || ERROR_MESSAGES.GENERIC}
        </p>

        {getBrowserIssues()}

        <div className="mt-6">
          <button
            onClick={resetErrorBoundary || (() => window.location.reload())}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
          >
            Try again
          </button>
        </div>

        <div className="mt-4 text-sm text-gray-500">
          <p>You might want to try:</p>
          <ul className="list-disc list-inside mt-2">
            <li>Using a modern browser like Chrome, Firefox, or Edge</li>
            <li>Allowing camera access when prompted</li>
            <li>Checking your internet connection</li>
            <li>Restarting your browser</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ErrorFallback;
