import { useState, useEffect, useRef } from 'react';
import { Send, Phone, X, MoreVertical, ImagePlus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';
import { useConversations } from '@/hooks/useConversations';
import { useMessages } from '@/hooks/useMessages';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_by_recipient: boolean;
}

interface Conversation {
  id: string;
  user_1_id: string;
  user_2_id: string;
  last_message_at: string;
}

export function MessagingPage() {
  const user = useAuthStore((state) => state.user);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [otherUser, setOtherUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations
  useEffect(() => {
    if (!user) return;
    loadConversations();
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;

    try {
      setLoadingConversations(true);

      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`user_1_id.eq.${user.id},user_2_id.eq.${user.id}`)
        .order('last_message_at', { ascending: false });

      if (error) throw error;

      setConversations((data || []) as Conversation[]);
      if (data && data.length > 0) {
        setSelectedConversationId(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoadingConversations(false);
    }
  };

  // Load messages for selected conversation
  useEffect(() => {
    if (!selectedConversationId) return;
    loadMessages();
  }, [selectedConversationId]);

  const loadMessages = async () => {
    if (!selectedConversationId) return;

    try {
      setLoadingMessages(true);

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', selectedConversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages((data || []) as Message[]);

      // Get the other user
      const conv = conversations.find((c) => c.id === selectedConversationId);
      if (conv) {
        const otherUserId = conv.user_1_id === user?.id ? conv.user_2_id : conv.user_1_id;
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', otherUserId)
          .single();

        setOtherUser(userData);
      }

      // Mark as read
      await supabase
        .from('conversations')
        .update({
          user_1_last_read_at: new Date().toISOString(),
        })
        .eq('id', selectedConversationId);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!messageInput.trim() || !selectedConversationId || !user) return;

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConversationId,
          sender_id: user.id,
          content: messageInput.trim(),
          content_type: 'text',
        })
        .select()
        .single();

      if (error) throw error;

      setMessages((prev) => [...prev, data as Message]);
      setMessageInput('');

      // Update conversation's last message
      await supabase
        .from('conversations')
        .update({
          last_message_at: new Date().toISOString(),
          last_message_preview: messageInput.trim().substring(0, 100),
        })
        .eq('id', selectedConversationId);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Conversations List */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto">
          {loadingConversations ? (
            <div className="p-4 text-center text-gray-500">Loading conversations...</div>
          ) : conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No conversations yet</div>
          ) : (
            conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversationId(conv.id)}
                className={`w-full p-4 border-b border-gray-100 text-left hover:bg-gray-50 transition ${
                  selectedConversationId === conv.id ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-blue-100" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">User {conv.user_1_id.substring(0, 8)}</p>
                    <p className="text-sm text-gray-500 truncate">Last message at {new Date(conv.last_message_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedConversationId && otherUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100" />
                <div>
                  <p className="font-semibold text-gray-900">{otherUser?.email || 'User'}</p>
                  <p className="text-sm text-gray-500">Active now</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <Phone size={20} className="text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg">
                  <MoreVertical size={20} className="text-gray-600" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingMessages ? (
                <div className="text-center text-gray-500">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-500">No messages yet. Start the conversation!</div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-lg ${
                        message.sender_id === user?.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-900'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${message.sender_id === user?.id ? 'text-blue-100' : 'text-gray-500'}`}>
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <button type="button" className="p-2 hover:bg-gray-100 rounded-lg">
                  <ImagePlus size={20} className="text-gray-600" />
                </button>
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Select a conversation to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
}
