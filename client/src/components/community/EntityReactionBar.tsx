import React, { useState } from 'react';
import { useEntityReactions } from '../../hooks/useEntityReactions';
import { useAuth } from '../../hooks/useAuth';

interface EntityReactionBarProps {
  entityType: string;
  entityId: string;
}

const COMMON_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '✨', '💯'];

export function EntityReactionBar({ entityType, entityId }: EntityReactionBarProps) {
  const { reactions, addReaction, removeReaction, getReactionCounts } = useEntityReactions(
    entityType,
    entityId
  );
  const { user } = useAuth();
  const [showPicker, setShowPicker] = useState(false);
  const counts = getReactionCounts();

  const hasUserReacted = (emoji: string) => {
    return reactions.some(r => r.reaction_emoji === emoji && r.user_id === user?.id);
  };

  const handleReactionClick = async (emoji: string) => {
    if (!user) return;

    if (hasUserReacted(emoji)) {
      await removeReaction(emoji);
    } else {
      await addReaction(emoji);
    }
  };

  return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
      <div className="flex gap-1 flex-wrap">
        {Object.entries(counts).map(([emoji, count]) => (
          <button
            key={emoji}
            onClick={() => handleReactionClick(emoji)}
            className={`px-3 py-1 rounded-full text-sm transition-colors ${
              hasUserReacted(emoji)
                ? 'bg-blue-200 text-blue-800'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {emoji} {count}
          </button>
        ))}
      </div>

      <div className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          disabled={!user}
          className="px-3 py-1 bg-gray-200 text-gray-700 rounded-full hover:bg-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          +
        </button>

        {showPicker && user && (
          <div className="absolute bottom-full right-0 mb-2 p-2 bg-white border rounded-lg shadow-lg grid grid-cols-4 gap-1 w-48">
            {COMMON_REACTIONS.map(emoji => (
              <button
                key={emoji}
                onClick={() => {
                  handleReactionClick(emoji);
                  setShowPicker(false);
                }}
                className="p-2 text-2xl hover:bg-gray-100 rounded"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
