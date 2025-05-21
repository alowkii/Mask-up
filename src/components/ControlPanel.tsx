import React, { useRef } from "react";
import { Filter } from "../types/Filter";

interface ControlPanelProps {
  onScreenshot: () => void;
  onFilterPanelToggle: () => void;
  isFilterPanelOpen: boolean;
  numFiltersSelected: number;
  className?: string;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  onScreenshot,
  onFilterPanelToggle,
  isFilterPanelOpen,
  numFiltersSelected,
  className = "",
}) => {
  return (
    <div
      className={`bg-white bg-opacity-90 rounded-lg p-3 shadow-lg ${className}`}
    >
      <div className="flex items-center justify-between gap-4">
        <button
          onClick={onFilterPanelToggle}
          className={`
            flex items-center justify-center p-3 rounded-full 
            transition-colors duration-200
            ${
              isFilterPanelOpen
                ? "bg-blue-100 text-blue-600"
                : "bg-gray-100 hover:bg-gray-200"
            }
            relative
          `}
          aria-label="Filters"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="4" y1="7" x2="20" y2="7"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
            <line x1="6" y1="17" x2="18" y2="17"></line>
          </svg>

          {numFiltersSelected > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs rounded-full flex items-center justify-center">
              {numFiltersSelected}
            </span>
          )}
        </button>

        <button
          onClick={onScreenshot}
          className="flex items-center justify-center p-3 rounded-full bg-red-500 text-white hover:bg-red-600 transition-colors duration-200 shadow"
          aria-label="Take a picture"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="8"></circle>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
