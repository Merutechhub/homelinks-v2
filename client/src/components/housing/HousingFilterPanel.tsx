import React, { useState, useEffect } from 'react';

interface HousingFilterPanelProps {
  onFilter?: (filters: HousingFilters) => void;
}

export interface HousingFilters {
  city?: string;
  state?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  petFriendly?: boolean;
  furnished?: boolean;
}

export function HousingFilterPanel({ onFilter }: HousingFilterPanelProps) {
  const [filters, setFilters] = useState<HousingFilters>({
    minPrice: 500,
    maxPrice: 3000,
  });

  const handleChange = (key: keyof HousingFilters, value: any) => {
    const updated = { ...filters, [key]: value };
    setFilters(updated);
    onFilter?.(updated);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Filter Results</h2>

      <div className="space-y-4">
        {/* Location */}
        <div>
          <label className="block text-sm font-medium mb-2">City</label>
          <input
            type="text"
            value={filters.city || ''}
            onChange={(e) => handleChange('city', e.target.value || undefined)}
            placeholder="Search by city"
            className="w-full px-3 py-2 border rounded-lg"
          />
        </div>

        {/* Price Range */}
        <div>
          <label className="block text-sm font-medium mb-2">Price Range</label>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={filters.minPrice}
              onChange={(e) => handleChange('minPrice', Number(e.target.value))}
              placeholder="Min"
              className="flex-1 px-3 py-2 border rounded-lg text-sm"
            />
            <span>-</span>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => handleChange('maxPrice', Number(e.target.value))}
              placeholder="Max"
              className="flex-1 px-3 py-2 border rounded-lg text-sm"
            />
          </div>
        </div>

        {/* Bedrooms */}
        <div>
          <label className="block text-sm font-medium mb-2">Bedrooms</label>
          <select
            value={filters.bedrooms || ''}
            onChange={(e) => handleChange('bedrooms', e.target.value ? Number(e.target.value) : undefined)}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="">Any</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4+</option>
          </select>
        </div>

        {/* Amenities */}
        <div>
          <label className="flex items-center gap-2 mb-2">
            <input
              type="checkbox"
              checked={filters.petFriendly || false}
              onChange={(e) => handleChange('petFriendly', e.target.checked || undefined)}
            />
            <span className="text-sm font-medium">Pet Friendly</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.furnished || false}
              onChange={(e) => handleChange('furnished', e.target.checked || undefined)}
            />
            <span className="text-sm font-medium">Furnished</span>
          </label>
        </div>

        <button
          onClick={() => {
            setFilters({});
            onFilter?.({});
          }}
          className="w-full px-3 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 text-sm font-medium"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}
