import React, { useState } from "react";

interface FilterCalibrationProps {
  onPositionChange: (filterId: string, adjustments: any) => void;
  selectedFilters: any[];
  isVisible: boolean;
  onToggle: () => void;
}

const FilterCalibration: React.FC<FilterCalibrationProps> = ({
  onPositionChange,
  selectedFilters,
  isVisible,
  onToggle,
}) => {
  const [adjustments, setAdjustments] = useState<Record<string, any>>({
    glasses: { x: 0, y: 0, z: 0, scale: 1, rotX: 0, rotY: 0, rotZ: 0 },
    hat: { x: 0, y: 0, z: 0, scale: 1, rotX: 0, rotY: 0, rotZ: 0 },
    beard: { x: 0, y: 0, z: 0, scale: 1, rotX: 0, rotY: 0, rotZ: 0 },
    mustache: { x: 0, y: 0, z: 0, scale: 1, rotX: 0, rotY: 0, rotZ: 0 },
  });

  const handleSliderChange = (
    filterId: string,
    property: string,
    value: number
  ) => {
    const newAdjustments = {
      ...adjustments,
      [filterId]: {
        ...adjustments[filterId],
        [property]: value,
      },
    };
    setAdjustments(newAdjustments);
    onPositionChange(filterId, newAdjustments[filterId]);
  };

  const resetFilter = (filterId: string) => {
    const reset = { x: 0, y: 0, z: 0, scale: 1, rotX: 0, rotY: 0, rotZ: 0 };
    setAdjustments((prev) => ({
      ...prev,
      [filterId]: reset,
    }));
    onPositionChange(filterId, reset);
  };

  if (!isVisible) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-4 left-4 bg-blue-500 text-white p-2 rounded-full shadow-lg z-50"
        title="Open Calibration"
      >
        ⚙️
      </button>
    );
  }

  return (
    <div className="fixed left-4 top-20 bottom-20 w-80 bg-white bg-opacity-95 rounded-lg shadow-lg p-4 overflow-y-auto z-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold">Filter Calibration</h3>
        <button
          onClick={onToggle}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {selectedFilters.map((filter) => (
        <div key={filter.id} className="mb-6 p-3 border rounded">
          <div className="flex justify-between items-center mb-3">
            <h4 className="font-semibold">{filter.name}</h4>
            <button
              onClick={() => resetFilter(filter.id)}
              className="text-xs bg-gray-200 px-2 py-1 rounded"
            >
              Reset
            </button>
          </div>

          {/* Position Controls */}
          <div className="space-y-2">
            <div>
              <label className="text-xs text-gray-600">X Position</label>
              <input
                type="range"
                min="-0.5"
                max="0.5"
                step="0.01"
                value={adjustments[filter.id]?.x || 0}
                onChange={(e) =>
                  handleSliderChange(filter.id, "x", parseFloat(e.target.value))
                }
                className="w-full"
              />
              <span className="text-xs text-gray-500">
                {(adjustments[filter.id]?.x || 0).toFixed(2)}
              </span>
            </div>

            <div>
              <label className="text-xs text-gray-600">Y Position</label>
              <input
                type="range"
                min="-0.5"
                max="0.5"
                step="0.01"
                value={adjustments[filter.id]?.y || 0}
                onChange={(e) =>
                  handleSliderChange(filter.id, "y", parseFloat(e.target.value))
                }
                className="w-full"
              />
              <span className="text-xs text-gray-500">
                {(adjustments[filter.id]?.y || 0).toFixed(2)}
              </span>
            </div>

            <div>
              <label className="text-xs text-gray-600">Z Position</label>
              <input
                type="range"
                min="-0.2"
                max="0.2"
                step="0.005"
                value={adjustments[filter.id]?.z || 0}
                onChange={(e) =>
                  handleSliderChange(filter.id, "z", parseFloat(e.target.value))
                }
                className="w-full"
              />
              <span className="text-xs text-gray-500">
                {(adjustments[filter.id]?.z || 0).toFixed(3)}
              </span>
            </div>

            <div>
              <label className="text-xs text-gray-600">Scale</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.05"
                value={adjustments[filter.id]?.scale || 1}
                onChange={(e) =>
                  handleSliderChange(
                    filter.id,
                    "scale",
                    parseFloat(e.target.value)
                  )
                }
                className="w-full"
              />
              <span className="text-xs text-gray-500">
                {(adjustments[filter.id]?.scale || 1).toFixed(2)}
              </span>
            </div>

            {/* Rotation Controls */}
            <div>
              <label className="text-xs text-gray-600">Rotation X</label>
              <input
                type="range"
                min="-0.5"
                max="0.5"
                step="0.05"
                value={adjustments[filter.id]?.rotX || 0}
                onChange={(e) =>
                  handleSliderChange(
                    filter.id,
                    "rotX",
                    parseFloat(e.target.value)
                  )
                }
                className="w-full"
              />
              <span className="text-xs text-gray-500">
                {(adjustments[filter.id]?.rotX || 0).toFixed(2)}
              </span>
            </div>

            <div>
              <label className="text-xs text-gray-600">Rotation Y</label>
              <input
                type="range"
                min="-0.5"
                max="0.5"
                step="0.05"
                value={adjustments[filter.id]?.rotY || 0}
                onChange={(e) =>
                  handleSliderChange(
                    filter.id,
                    "rotY",
                    parseFloat(e.target.value)
                  )
                }
                className="w-full"
              />
              <span className="text-xs text-gray-500">
                {(adjustments[filter.id]?.rotY || 0).toFixed(2)}
              </span>
            </div>

            <div>
              <label className="text-xs text-gray-600">Rotation Z</label>
              <input
                type="range"
                min="-0.5"
                max="0.5"
                step="0.05"
                value={adjustments[filter.id]?.rotZ || 0}
                onChange={(e) =>
                  handleSliderChange(
                    filter.id,
                    "rotZ",
                    parseFloat(e.target.value)
                  )
                }
                className="w-full"
              />
              <span className="text-xs text-gray-500">
                {(adjustments[filter.id]?.rotZ || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      ))}

      <div className="mt-4 p-3 bg-gray-100 rounded text-xs">
        <p>
          <strong>Tips:</strong>
        </p>
        <ul className="list-disc list-inside text-gray-600 mt-1">
          <li>X: Left (-) / Right (+)</li>
          <li>Y: Down (-) / Up (+)</li>
          <li>Z: Back (-) / Forward (+)</li>
          <li>Use Reset to return to defaults</li>
        </ul>
      </div>
    </div>
  );
};

export default FilterCalibration;
