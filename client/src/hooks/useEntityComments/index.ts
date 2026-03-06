import { useEffect, useState } from 'react';

interface EntityComment {
  id: string;
  entity_type: string;
  entity_id: string;
  author_id: string;
  content: string;
  reply_to_comment_id: string | null;
  created_at: string;
  updated_at: string;
  author_username?: string;
  author_avatar?: string;
  replies?: EntityComment[];
}

export function useEntityComments(entityType: string, entityId: string) {
  const [comments, setComments] = useState<EntityComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/comments/${entityType}/${entityId}`);
        if (!res.ok) throw new Error('Failed to fetch comments');
        const data = await res.json();
        setComments(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (entityType && entityId) fetchComments();
  }, [entityType, entityId]);

  const addComment = async (content: string, replyToId?: string) => {
    try {
      const res = await fetch(`/api/comments/${entityType}/${entityId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, reply_to_comment_id: replyToId || null }),
      });
      if (!res.ok) throw new Error('Failed to add comment');
      const newComment = await res.json();
      setComments([...comments, newComment]);
      return newComment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const res = await fetch(`/api/comments/${commentId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete comment');
      setComments(comments.filter(c => c.id !== commentId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  return { comments, loading, error, addComment, deleteComment };
}
