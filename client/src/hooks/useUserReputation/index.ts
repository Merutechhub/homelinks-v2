import { useEffect, useState } from 'react';

interface UserReputation {
  id: string;
  user_id: string;
  rating_from_user_id: string;
  rating_value: number;
  comment: string | null;
  created_at: string;
}

export function useUserReputation(userId: string) {
  const [ratings, setRatings] = useState<UserReputation[]>([]);
  const [average, setAverage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReputation = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/reputation/${userId}`);
        if (!res.ok) throw new Error('Failed to fetch reputation');
        const data = await res.json();
        setRatings(data);
        if (data.length > 0) {
          const avg = data.reduce((sum: number, r: UserReputation) => sum + r.rating_value, 0) / data.length;
          setAverage(Math.round(avg * 10) / 10);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchReputation();
  }, [userId]);

  const submitRating = async (rating_value: number, comment: string) => {
    try {
      const res = await fetch(`/api/reputation/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating_value, comment }),
      });
      if (!res.ok) throw new Error('Failed to submit rating');
      const newRating = await res.json();
      setRatings([...ratings, newRating]);
      return newRating;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  return { ratings, average, loading, error, submitRating, count: ratings.length };
}
