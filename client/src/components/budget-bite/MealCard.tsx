import React from 'react';
import { useMealRecommendations } from '../../hooks/useBudgetBite';

interface MealCardProps {
  mealId: string;
  title: string;
  estimatedCost: number;
  servings: number;
  prepTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  imageUrl?: string;
  tags?: string[];
  onViewRecipe?: () => void;
}

export function MealCard({
  mealId,
  title,
  estimatedCost,
  servings,
  prepTime,
  difficulty,
  imageUrl,
  tags = [],
  onViewRecipe,
}: MealCardProps) {
  const difficultyColor = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-red-100 text-red-800',
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      {imageUrl && <img src={imageUrl} alt={title} className="w-full h-40 object-cover" />}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2">{title}</h3>
        <div className="grid grid-cols-2 gap-2 text-sm mb-3">
          <div className="flex items-center gap-1">💰 ${estimatedCost}</div>
          <div className="flex items-center gap-1">👥 {servings}</div>
          <div className="flex items-center gap-1">⏱️ {prepTime}m</div>
          <div>
            <span className={`px-2 py-1 rounded text-xs font-medium ${difficultyColor[difficulty]}`}>
              {difficulty}
            </span>
          </div>
        </div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {tags.map(tag => (
              <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {tag}
              </span>
            ))}
          </div>
        )}
        <button
          onClick={onViewRecipe}
          className="w-full px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium"
        >
          View Recipe
        </button>
      </div>
    </div>
  );
}

interface MealRecommendationsProps {
  userId: string;
}

export function MealRecommendations({ userId }: MealRecommendationsProps) {
  const { recommendations, loading } = useMealRecommendations(userId);

  if (loading) return <div className="text-center py-8">Loading recommendations...</div>;
  if (recommendations.length === 0) return <div className="text-center py-8">No recommendations yet</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Recommended for You</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recommendations.map(meal => (
          <MealCard key={meal.id} mealId={meal.id} title={meal.title} estimatedCost={meal.estimated_cost} servings={meal.servings} prepTime={meal.prep_time_minutes} difficulty={meal.difficulty} imageUrl={meal.image_url || undefined} tags={meal.tags} />
        ))}
      </div>
    </div>
  );
}
