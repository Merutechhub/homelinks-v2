-- ============================================
-- MIGRATION 002: Phase 1-2 - Image Upload & Messaging
-- ============================================
-- Phase 1: Image Upload System
-- Phase 2: Messaging System
-- Status: Core communication features

-- PHASE 1: Image Upload System
-- (Images stored in media_uploads table from core migration)

CREATE TABLE IF NOT EXISTS public.image_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cloudinary_public_id TEXT NOT NULL UNIQUE,
  media_id UUID REFERENCES public.media_uploads(id) ON DELETE CASCADE,
  secure_url TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.image_signatures ENABLE ROW LEVEL SECURITY;
CREATE POLICY "image_sig_user_view" ON public.image_signatures FOR SELECT 
  USING (auth.uid() = user_id OR true);
CREATE POLICY "image_sig_user_manage" ON public.image_signatures FOR ALL 
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_image_sig_user ON public.image_signatures(user_id);
CREATE INDEX idx_image_sig_cloudinary ON public.image_signatures(cloudinary_public_id);

-- PHASE 2: Messaging System

-- 1. Conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_message_at TIMESTAMP
);

ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "conversations_user_view" ON public.conversations FOR SELECT 
  USING (auth.uid() = created_by OR 
         EXISTS (SELECT 1 FROM conversation_participants WHERE conversation_id = conversations.id AND user_id = auth.uid()));
CREATE POLICY "conversations_user_create" ON public.conversations FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE INDEX idx_conversations_created_by ON public.conversations(created_by);
CREATE INDEX idx_conversations_created_at ON public.conversations(created_at);

-- 2. Conversation Participants
CREATE TABLE IF NOT EXISTS public.conversation_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  last_read_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(conversation_id, user_id)
);

ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "participants_user_view" ON public.conversation_participants FOR SELECT 
  USING (auth.uid() = user_id OR 
         EXISTS (SELECT 1 FROM conversation_participants cp WHERE cp.conversation_id = conversation_participants.conversation_id AND cp.user_id = auth.uid()));
CREATE POLICY "participants_user_manage" ON public.conversation_participants FOR ALL 
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_participants_conv ON public.conversation_participants(conversation_id);
CREATE INDEX idx_participants_user ON public.conversation_participants(user_id);

-- 3. Messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'document', 'system')),
  attachment_url TEXT,
  attachment_type TEXT,
  is_edited BOOLEAN DEFAULT false,
  edited_at TIMESTAMP,
  read_by UUID[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "messages_user_view" ON public.messages FOR SELECT 
  USING (EXISTS (SELECT 1 FROM conversation_participants WHERE conversation_id = messages.conversation_id AND user_id = auth.uid()));
CREATE POLICY "messages_user_create" ON public.messages FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "messages_user_update" ON public.messages FOR UPDATE 
  USING (auth.uid() = sender_id) WITH CHECK (auth.uid() = sender_id);

CREATE INDEX idx_messages_conv ON public.messages(conversation_id);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_messages_created ON public.messages(created_at);

-- 4. Message Reactions
CREATE TABLE IF NOT EXISTS public.message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(message_id, user_id, reaction)
);

ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reactions_anyone_view" ON public.message_reactions FOR SELECT USING (true);
CREATE POLICY "reactions_user_manage" ON public.message_reactions FOR ALL 
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_reactions_message ON public.message_reactions(message_id);
CREATE INDEX idx_reactions_user ON public.message_reactions(user_id);
