import { useEffect, useState } from 'react';

interface EntityReaction {
  id: string;
  entity_type: string;
  entity_id: string;
  user_id: string;
  reaction_emoji: string;
  created_at: string;
}

export function useEntityReactions(entityType: string, entityId: string) {
  const [reactions, setReactions] = useState<EntityReaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReactions = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/reactions/${entityType}/${entityId}`);
        if (!res.ok) throw new Error('Failed to fetch reactions');
        const data = await res.json();
        setReactions(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (entityType && entityId) fetchReactions();
  }, [entityType, entityId]);

  const addReaction = async (emoji: string) => {
    try {
      const res = await fetch(`/api/reactions/${entityType}/${entityId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reaction_emoji: emoji }),
      });
      if (!res.ok) throw new Error('Failed to add reaction');
      const newReaction = await res.json();
      setReactions([...reactions, newReaction]);
      return newReaction;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const removeReaction = async (emoji: string) => {
    try {
      const res = await fetch(`/api/reactions/${entityType}/${entityId}/${emoji}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to remove reaction');
      setReactions(reactions.filter(r => r.reaction_emoji !== emoji));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const getReactionCounts = () => {
    const counts: Record<string, number> = {};
    reactions.forEach(r => {
      counts[r.reaction_emoji] = (counts[r.reaction_emoji] || 0) + 1;
    });
    return counts;
  };

  return { reactions, loading, error, addReaction, removeReaction, getReactionCounts };
}
