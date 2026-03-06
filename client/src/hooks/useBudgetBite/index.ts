import { useEffect, useState } from 'react';

interface Meal {
  id: string;
  creator_id: string;
  title: string;
  description: string;
  estimated_cost: number;
  servings: number;
  prep_time_minutes: number;
  cook_time_minutes: number;
  difficulty: 'easy' | 'medium' | 'hard';
  image_url: string | null;
  tags: string[];
}

export function useBudgetSearch(params: {
  maxPrice?: number;
  servings?: number;
  prepTimeMax?: number;
  excludeIngredients?: string[];
}) {
  const [results, setResults] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (params.maxPrice) query.append('maxPrice', params.maxPrice.toString());
      if (params.servings) query.append('servings', params.servings.toString());
      if (params.prepTimeMax) query.append('prepTimeMax', params.prepTimeMax.toString());
      if (params.excludeIngredients?.length) {
        query.append('excludeIngredients', params.excludeIngredients.join(','));
      }

      const res = await fetch(`/api/budget-bite/search?${query}`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return { results, loading, error, search };
}

export function useMealRecommendations(userId: string) {
  const [recommendations, setRecommendations] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await fetch(`/api/budget-bite/recommendations/${userId}`);
        if (!res.ok) throw new Error('Failed to fetch recommendations');
        const data = await res.json();
        setRecommendations(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [userId]);

  return { recommendations, loading };
}

export function useCookingTracking(mealId: string) {
  const logMeal = async (rating: number, notes: string, actualCost: number) => {
    try {
      const res = await fetch(`/api/budget-bite/cooking-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meal_id: mealId, rating, notes, actual_cost: actualCost }),
      });
      if (!res.ok) throw new Error('Failed to log meal');
      return await res.json();
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return { logMeal };
}
