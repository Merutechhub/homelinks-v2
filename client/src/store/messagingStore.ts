import { create } from 'zustand';
import type { Database } from '@/lib/supabase';

type ConversationRow = Database['public']['Tables']['conversations']['Row'];
type MessageRow = Database['public']['Tables']['messages']['Row'];

export interface ConversationWithLastMessage extends ConversationRow {
  lastMessage?: MessageRow;
  unreadCount?: number;
}

interface MessagingState {
  conversations: ConversationWithLastMessage[];
  activeConversationId: string | null;
  messages: MessageRow[];
  loading: boolean;
  hasMore: boolean;
  cursor: string | null;

  // Actions
  setConversations: (conversations: ConversationWithLastMessage[]) => void;
  addConversation: (conversation: ConversationWithLastMessage) => void;
  updateConversation: (id: string, updates: Partial<ConversationWithLastMessage>) => void;
  setActiveConversation: (id: string | null) => void;
  setMessages: (messages: MessageRow[]) => void;
  addMessage: (message: MessageRow) => void;
  prependMessages: (messages: MessageRow[]) => void;
  setLoading: (loading: boolean) => void;
  setHasMore: (hasMore: boolean) => void;
  setCursor: (cursor: string | null) => void;
  reset: () => void;
}

export const useMessagingStore = create<MessagingState>((set) => ({
  conversations: [],
  activeConversationId: null,
  messages: [],
  loading: false,
  hasMore: true,
  cursor: null,

  setConversations: (conversations) => set({ conversations }),

  addConversation: (conversation) =>
    set((state) => ({
      conversations: [conversation, ...state.conversations],
    })),

  updateConversation: (id, updates) =>
    set((state) => ({
      conversations: state.conversations.map((conv) =>
        conv.id === id ? { ...conv, ...updates } : conv
      ),
    })),

  setActiveConversation: (id) => set({ activeConversationId: id, messages: [], cursor: null }),

  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  prependMessages: (messages) =>
    set((state) => ({
      messages: [...messages, ...state.messages],
    })),

  setLoading: (loading) => set({ loading }),

  setHasMore: (hasMore) => set({ hasMore }),

  setCursor: (cursor) => set({ cursor }),

  reset: () =>
    set({
      conversations: [],
      activeConversationId: null,
      messages: [],
      loading: false,
      hasMore: true,
      cursor: null,
    }),
}));
