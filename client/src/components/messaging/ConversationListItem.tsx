import { MessageCircle, User } from 'lucide-react';
import { formatRelativeTime } from '@/lib/utils';
import type { ConversationWithLastMessage } from '@/store/messagingStore';

interface ConversationListItemProps {
  conversation: ConversationWithLastMessage;
  currentUserId: string;
  onClick: () => void;
  isActive?: boolean;
}

export function ConversationListItem({
  conversation,
  currentUserId,
  onClick,
  isActive = false,
}: ConversationListItemProps) {
  const otherUserId =
    conversation.user1_id === currentUserId ? conversation.user2_id : conversation.user1_id;

  const hasUnread = (conversation.unreadCount ?? 0) > 0;

  return (
    <button
      onClick={onClick}
      className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors border-b ${
        isActive ? 'bg-primary/5 border-l-4 border-l-primary' : ''
      }`}
    >
      {/* Avatar */}
      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
        <User className="w-6 h-6 text-gray-400" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between mb-1">
          <h3 className={`font-semibold truncate ${hasUnread ? 'text-gray-900' : 'text-gray-700'}`}>
            User {otherUserId.slice(0, 8)}
          </h3>
          {conversation.lastMessage && (
            <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
              {formatRelativeTime(conversation.lastMessage.created_at)}
            </span>
          )}
        </div>

        {conversation.lastMessage ? (
          <p
            className={`text-sm truncate ${
              hasUnread ? 'font-medium text-gray-900' : 'text-gray-600'
            }`}
          >
            {conversation.lastMessage.sender_id === currentUserId && 'You: '}
            {conversation.lastMessage.content}
          </p>
        ) : (
          <p className="text-sm text-gray-500 italic">No messages yet</p>
        )}
      </div>

      {/* Unread Badge */}
      {hasUnread && (
        <div className="w-6 h-6 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
          {conversation.unreadCount! > 9 ? '9+' : conversation.unreadCount}
        </div>
      )}
    </button>
  );
}
