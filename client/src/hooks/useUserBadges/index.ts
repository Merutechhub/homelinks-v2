import { useEffect, useState } from 'react';

interface UserBadge {
  id: string;
  user_id: string;
  badge_type: string;
  badge_name: string;
  badge_icon: string;
  unlocked_at: string;
}

export function useUserBadges(userId: string) {
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBadges = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/badges/${userId}`);
        if (!res.ok) throw new Error('Failed to fetch badges');
        const data = await res.json();
        setBadges(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchBadges();
  }, [userId]);

  const hasBadge = (badgeType: string) => {
    return badges.some(b => b.badge_type === badgeType);
  };

  return { badges, loading, error, hasBadge };
}
