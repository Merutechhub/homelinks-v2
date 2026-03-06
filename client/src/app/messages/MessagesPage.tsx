import { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { useConversations } from '@/hooks/useConversations';
import { useMessagingStore } from '@/store/messagingStore';
import { useAuthStore } from '@/store/authStore';
import { ConversationListItem } from '@/components/messaging/ConversationListItem';
import { MessageThread } from '@/components/messaging/MessageThread';

export default function MessagesPage() {
  const user = useAuthStore((state) => state.user);
  const { conversations, loading } = useConversations();
  const activeConversationId = useMessagingStore((state) => state.activeConversationId);
  const setActiveConversation = useMessagingStore((state) => state.setActiveConversation);
  const [showThread, setShowThread] = useState(false);

  const handleSelectConversation = (id: string) => {
    setActiveConversation(id);
    setShowThread(true);
  };

  const handleBack = () => {
    setShowThread(false);
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card p-8 text-center">
          <MessageCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Sign in to view messages</h2>
          <p className="text-gray-600">You need to be signed in to access your messages.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)]">
      <div className="container mx-auto h-full max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 h-full border rounded-lg overflow-hidden bg-white">
          {/* Conversation List */}
          <div
            className={`lg:col-span-1 border-r overflow-y-auto ${
              showThread ? 'hidden lg:block' : 'block'
            }`}
          >
            <div className="p-4 border-b bg-gray-50">
              <h1 className="text-xl font-bold">Messages</h1>
            </div>

            {loading ? (
              <div className="p-8 text-center text-gray-500">Loading conversations...</div>
            ) : conversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No conversations yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Start chatting with landlords or sellers!
                </p>
              </div>
            ) : (
              <div>
                {conversations.map((conversation) => (
                  <ConversationListItem
                    key={conversation.id}
                    conversation={conversation}
                    currentUserId={user.id}
                    onClick={() => handleSelectConversation(conversation.id)}
                    isActive={conversation.id === activeConversationId}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Message Thread */}
          <div
            className={`lg:col-span-2 ${
              showThread || !activeConversationId ? 'block' : 'hidden lg:block'
            }`}
          >
            {activeConversationId ? (
              <MessageThread conversationId={activeConversationId} onBack={handleBack} />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Select a conversation to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
