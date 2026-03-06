import { useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useMessagingStore, type ConversationWithLastMessage } from '@/store/messagingStore';
import { useAuthStore } from '@/store/authStore';

export function useConversations() {
  const user = useAuthStore((state) => state.user);
  const conversations = useMessagingStore((state) => state.conversations);
  const setConversations = useMessagingStore((state) => state.setConversations);
  const addConversation = useMessagingStore((state) => state.addConversation);
  const updateConversation = useMessagingStore((state) => state.updateConversation);
  const loading = useMessagingStore((state) => state.loading);
  const setLoading = useMessagingStore((state) => state.setLoading);

  const fetchConversations = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch conversations for current user
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .select('*')
        .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (convError) throw convError;

      // For each conversation, fetch the last message
      const conversationsWithMessages: ConversationWithLastMessage[] = await Promise.all(
        (convData || []).map(async (conv) => {
          const { data: msgData } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          // Count unread messages
          const { count } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .eq('read', false)
            .neq('sender_id', user.id);

          return {
            ...conv,
            lastMessage: msgData || undefined,
            unreadCount: count || 0,
          };
        })
      );

      setConversations(conversationsWithMessages);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  }, [user, setConversations, setLoading]);

  // Subscribe to new messages for unread count updates
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('conversations-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const newMessage = payload.new as any;

          // Update the conversation's last message and unread count
          updateConversation(newMessage.conversation_id, {
            lastMessage: newMessage,
            unreadCount: conversations.find((c) => c.id === newMessage.conversation_id)
              ?.unreadCount
              ? (conversations.find((c) => c.id === newMessage.conversation_id)!.unreadCount! + 1)
              : 1,
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user, conversations, updateConversation]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    loading,
    refetch: fetchConversations,
  };
}
