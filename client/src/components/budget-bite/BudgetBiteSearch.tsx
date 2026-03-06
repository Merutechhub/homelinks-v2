import React, { useState } from 'react';
import { useBudgetSearch } from '../../hooks/useBudgetBite';

interface SearchFilters {
  maxPrice: number;
  servings: number;
  prepTimeMax: number;
  excludeIngredients: string[];
}

export function BudgetBiteSearch() {
  const [filters, setFilters] = useState<SearchFilters>({
    maxPrice: 15,
    servings: 2,
    prepTimeMax: 60,
    excludeIngredients: [],
  });
  const { results, loading, search } = useBudgetSearch(filters);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    search();
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Budget Bite Search</h1>

      <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Max Price</label>
            <input
              type="number"
              value={filters.maxPrice}
              onChange={(e) => setFilters({ ...filters, maxPrice: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded"
              step="5"
              min="5"
              max="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Servings</label>
            <input
              type="number"
              value={filters.servings}
              onChange={(e) => setFilters({ ...filters, servings: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded"
              min="1"
              max="10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Max Prep Time (min)</label>
            <input
              type="number"
              value={filters.prepTimeMax}
              onChange={(e) => setFilters({ ...filters, prepTimeMax: Number(e.target.value) })}
              className="w-full px-3 py-2 border rounded"
              step="15"
              min="15"
              max="240"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Exclude (comma)</label>
            <input
              type="text"
              placeholder="e.g., nuts, dairy"
              onChange={(e) =>
                setFilters({
                  ...filters,
                  excludeIngredients: e.target.value.split(',').map(s => s.trim()),
                })
              }
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Searching...' : 'Search Meals'}
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map(meal => (
          <div key={meal.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
            {meal.image_url && (
              <img
                src={meal.image_url}
                alt={meal.title}
                className="w-full h-40 object-cover"
              />
            )}
            <div className="p-4">
              <h3 className="font-bold text-lg mb-2">{meal.title}</h3>
              <p className="text-gray-600 text-sm mb-3">{meal.description}</p>
              <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                <div>💰 ${meal.estimated_cost}</div>
                <div>👥 {meal.servings} servings</div>
                <div>⏱️ {meal.prep_time_minutes}min</div>
                <div>📊 {meal.difficulty}</div>
              </div>
              {meal.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {meal.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <button className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                View Recipe
              </button>
            </div>
          </div>
        ))}
      </div>

      {!loading && results.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <p>No meals found. Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
}
