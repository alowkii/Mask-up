import React from "react";
import { Filter } from "../types/Filter";

interface FilterSelectorProps {
  filters: Filter[];
  selectedFilters: Filter[];
  onFilterToggle: (filter: Filter) => void;
  className?: string;
}

const FilterSelector: React.FC<FilterSelectorProps> = ({
  filters,
  selectedFilters,
  onFilterToggle,
  className = "",
}) => {
  // Group filters by category
  const filtersByCategory = filters.reduce<Record<string, Filter[]>>(
    (acc, filter) => {
      if (!acc[filter.category]) {
        acc[filter.category] = [];
      }
      acc[filter.category].push(filter);
      return acc;
    },
    {}
  );

  const isFilterSelected = (filter: Filter) => {
    return selectedFilters.some((f) => f.id === filter.id);
  };

  return (
    <div className={`bg-white rounded-lg shadow-lg p-4 ${className}`}>
      <h2 className="text-slate-900 text-lg font-bold mb-4">Filters</h2>

      {Object.entries(filtersByCategory).map(([category, categoryFilters]) => (
        <div key={category} className="mb-6">
          <h3 className="text-sm font-semibold uppercase text-gray-500 mb-2">
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </h3>

          <div className="flex flex-wrap gap-3">
            {categoryFilters.map((filter) => (
              <button
                key={filter.id}
                className={`
                  w-16 h-16 rounded-lg overflow-hidden 
                  flex items-center justify-center
                  transition-all duration-200
                  bg-black
                  ${
                    isFilterSelected(filter)
                      ? "ring-2 ring-blue-500 shadow-lg scale-110"
                      : "ring-1 ring-gray-200 hover:ring-blue-300"
                  }
                `}
                onClick={() => onFilterToggle(filter)}
                aria-pressed={isFilterSelected(filter)}
                title={filter.name}
              >
                <img
                  src={filter.image}
                  alt={filter.name}
                  className="max-w-full max-h-full object-contain"
                />
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default FilterSelector;
