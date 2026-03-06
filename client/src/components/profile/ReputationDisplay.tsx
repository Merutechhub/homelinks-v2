import React from 'react';
import { useUserReputation } from '../../hooks/useUserReputation';

interface ReputationDisplayProps {
  userId: string;
}

export function ReputationDisplay({ userId }: ReputationDisplayProps) {
  const { average, ratings, count } = useUserReputation(userId);

  const renderStars = (rating: number) => {
    const filled = Math.floor(rating);
    const partial = rating % 1 >= 0.5 ? 1 : 0;
    const empty = 5 - filled - partial;
    return (
      <div className="flex gap-1">
        {'★'.repeat(filled).split('').map((s, i) => (
          <span key={`filled-${i}`} className="text-yellow-400">{s}</span>
        ))}
        {partial > 0 && <span className="text-yellow-400">⭐</span>}
        {'☆'.repeat(empty).split('').map((s, i) => (
          <span key={`empty-${i}`} className="text-gray-300">{s}</span>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Reputation</h2>

      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <div className="text-4xl font-bold">{average.toFixed(1)}</div>
          <div>
            {renderStars(average)}
            <p className="text-sm text-gray-600 mt-1">{count} reviews</p>
          </div>
        </div>
      </div>

      {ratings.length > 0 && (
        <div>
          <h3 className="font-semibold mb-3">Recent Reviews</h3>
          <div className="space-y-3">
            {ratings.slice(0, 5).map(rating => (
              <div key={rating.id} className="border-l-4 border-yellow-400 pl-3">
                <div className="flex items-center gap-2">
                  {renderStars(rating.rating_value)}
                </div>
                {rating.comment && <p className="text-sm text-gray-700 mt-1">{rating.comment}</p>}
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(rating.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
