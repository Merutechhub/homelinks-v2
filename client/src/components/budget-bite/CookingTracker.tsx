import React, { useState } from 'react';
import { useCookingTracking } from '../../hooks/useBudgetBite';

interface CookingTrackingProps {
  mealId: string;
  mealTitle: string;
  onLogged?: () => void;
}

export function CookingTracker({ mealId, mealTitle, onLogged }: CookingTrackingProps) {
  const { logMeal } = useCookingTracking(mealId);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [notes, setNotes] = useState('');
  const [actualCost, setActualCost] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await logMeal(rating, notes, Number(actualCost) || 0);
      setShowForm(false);
      setRating(5);
      setNotes('');
      setActualCost('');
      onLogged?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full px-3 py-2 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium"
        >
          Mark as Cooked
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="bg-gray-50 p-3 rounded border border-gray-200">
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Rating</label>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              className="w-full px-2 py-1 border rounded text-sm"
            >
              <option value={1}>1 - Poor</option>
              <option value={2}>2 - Fair</option>
              <option value={3}>3 - Good</option>
              <option value={4}>4 - Very Good</option>
              <option value={5}>5 - Excellent</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Actual Cost ($)</label>
            <input
              type="number"
              value={actualCost}
              onChange={(e) => setActualCost(e.target.value)}
              step="0.01"
              className="w-full px-2 py-1 border rounded text-sm"
              placeholder="Enter actual cost"
            />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full px-2 py-1 border rounded text-sm"
              placeholder="How did it go?"
            />
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 text-sm font-medium"
            >
              {submitting ? 'Logging...' : 'Log Meal'}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 px-2 py-1 border rounded hover:bg-gray-100 text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </>
  );
}
