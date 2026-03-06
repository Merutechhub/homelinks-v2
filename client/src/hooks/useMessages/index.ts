import { useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useMessagingStore } from '@/store/messagingStore';
import { useAuthStore } from '@/store/authStore';

const PAGE_SIZE = 50;

export function useMessages(conversationId: string | null) {
  const user = useAuthStore((state) => state.user);
  const messages = useMessagingStore((state) => state.messages);
  const setMessages = useMessagingStore((state) => state.setMessages);
  const addMessage = useMessagingStore((state) => state.addMessage);
  const prependMessages = useMessagingStore((state) => state.prependMessages);
  const loading = useMessagingStore((state) => state.loading);
  const hasMore = useMessagingStore((state) => state.hasMore);
  const cursor = useMessagingStore((state) => state.cursor);
  const setLoading = useMessagingStore((state) => state.setLoading);
  const setHasMore = useMessagingStore((state) => state.setHasMore);
  const setCursor = useMessagingStore((state) => state.setCursor);

  const fetchMessages = useCallback(async () => {
    if (!conversationId || !user) return;

    try {
      setLoading(true);

      let query = supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(PAGE_SIZE);

      if (cursor) {
        query = query.lt('created_at', cursor);
      }

      const { data, error } = await query;

      if (error) throw error;

      if (cursor) {
        prependMessages(data || []);
      } else {
        setMessages((data || []).reverse());
      }

      setHasMore(data ? data.length === PAGE_SIZE : false);
      if (data && data.length > 0) {
        setCursor(data[data.length - 1].created_at);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  }, [conversationId, user, cursor, setMessages, prependMessages, setLoading, setHasMore, setCursor]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!conversationId || !user) return;

      try {
        const { data, error } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            sender_id: user.id,
            content,
            read: false,
          })
          .select()
          .single();

        if (error) throw error;

        // Update conversation's updated_at
        await supabase
          .from('conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', conversationId);

        return data;
      } catch (error) {
        console.error('Error sending message:', error);
        throw error;
      }
    },
    [conversationId, user]
  );

  const markAsRead = useCallback(async () => {
    if (!conversationId || !user) return;

    try {
      await supabase
        .from('messages')
        .update({ read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id)
        .eq('read', false);
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [conversationId, user]);

  // Subscribe to new messages
  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          addMessage(payload.new as any);
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [conversationId, addMessage]);

  useEffect(() => {
    if (conversationId) {
      fetchMessages();
      markAsRead();
    }
  }, [conversationId, fetchMessages, markAsRead]);

  return {
    messages,
    loading,
    hasMore,
    loadMore: fetchMessages,
    sendMessage,
    markAsRead,
  };
}
