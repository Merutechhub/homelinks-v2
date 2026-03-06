import React, { useState } from 'react';
import { useEntityComments } from '../../hooks/useEntityComments';
import { useAuth } from '../../hooks/useAuth';

interface EntityCommentThreadProps {
  entityType: string;
  entityId: string;
}

export function EntityCommentThread({ entityType, entityId }: EntityCommentThreadProps) {
  const { comments, loading, addComment, deleteComment } = useEntityComments(entityType, entityId);
  const { user } = useAuth();
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      await addComment(newComment, replyingTo || undefined);
      setNewComment('');
      setReplyingTo(null);
    } finally {
      setSubmitting(false);
    }
  };

  const topLevelComments = comments.filter(c => !c.reply_to_comment_id);
  const getReplies = (parentId: string) => comments.filter(c => c.reply_to_comment_id === parentId);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-bold mb-4">Comments ({comments.length})</h3>

      <form onSubmit={handleSubmit} className="mb-6 p-4 bg-gray-50 rounded-lg">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder={replyingTo ? 'Write a reply...' : 'Add a comment...'}
          rows={3}
          className="w-full px-3 py-2 border rounded-lg mb-2"
          disabled={!user}
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={submitting || !newComment.trim() || !user}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
          >
            {submitting ? 'Posting...' : 'Post'}
          </button>
          {replyingTo && (
            <button
              type="button"
              onClick={() => { setReplyingTo(null); setNewComment(''); }}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel Reply
            </button>
          )}
        </div>
        {!user && <p className="text-sm text-gray-500 mt-2">Sign in to comment</p>}
      </form>

      <div className="space-y-4">
        {topLevelComments.map(comment => (
          <div key={comment.id}>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {comment.author_avatar && (
                    <img
                      src={comment.author_avatar}
                      alt={comment.author_username}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span className="font-semibold text-sm">{comment.author_username}</span>
                </div>
                {user?.id === comment.author_id && (
                  <button
                    onClick={() => deleteComment(comment.id)}
                    className="text-red-600 text-sm hover:text-red-800"
                  >
                    Delete
                  </button>
                )}
              </div>
              <p className="text-gray-700 text-sm">{comment.content}</p>
              <div className="flex gap-3 mt-3">
                <button
                  onClick={() => setReplyingTo(comment.id)}
                  className="text-blue-600 text-sm hover:text-blue-800"
                >
                  Reply
                </button>
                <span className="text-xs text-gray-500">
                  {new Date(comment.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>

            {getReplies(comment.id).length > 0 && (
              <div className="ml-6 mt-2 space-y-2">
                {getReplies(comment.id).map(reply => (
                  <div key={reply.id} className="bg-gray-50 p-3 rounded-lg border-l-2 border-blue-400">
                    <div className="flex items-center gap-2 mb-1">
                      {reply.author_avatar && (
                        <img
                          src={reply.author_avatar}
                          alt={reply.author_username}
                          className="w-6 h-6 rounded-full"
                        />
                      )}
                      <span className="font-semibold text-xs">{reply.author_username}</span>
                    </div>
                    <p className="text-gray-700 text-xs">{reply.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {loading && <p className="text-gray-500 text-center py-4">Loading comments...</p>}
      {!loading && comments.length === 0 && (
        <p className="text-gray-500 text-center py-4">No comments yet. Be the first!</p>
      )}
    </div>
  );
}
