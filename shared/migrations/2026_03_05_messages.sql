-- Create messages table for storing individual messages
-- Each message belongs to a conversation

CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  
  -- Message content
  sender_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  content text NOT NULL,
  content_type text DEFAULT 'text' CHECK (content_type IN ('text', 'image', 'file')),
  
  -- Media attachments (for future enhancement)
  attachment_url text,
  attachment_type text CHECK (attachment_type IN ('image', 'file', NULL)),
  
  -- Message status
  is_edited boolean DEFAULT false,
  edited_at timestamp with time zone,
  is_deleted boolean DEFAULT false,
  deleted_at timestamp with time zone,
  
  -- Read receipts
  read_by_recipient boolean DEFAULT false,
  read_at timestamp with time zone,
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT valid_content CHECK (char_length(content) > 0),
  CONSTRAINT valid_timestamp CHECK (created_at <= COALESCE(edited_at, now()))
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_read_status ON public.messages(conversation_id, read_by_recipient);

-- Row Level Security (RLS) Policies
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Users can view messages from their conversations
CREATE POLICY "Users can view messages from their conversations"
  ON public.messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = messages.conversation_id
      AND (user_1_id = auth.uid() OR user_2_id = auth.uid())
    )
  );

-- Users can insert messages to their conversations
CREATE POLICY "Users can insert messages to their conversations"
  ON public.messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.conversations
      WHERE id = conversation_id
      AND (user_1_id = auth.uid() OR user_2_id = auth.uid())
    )
  );

-- Users can update their own messages
CREATE POLICY "Users can update own messages"
  ON public.messages
  FOR UPDATE
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

-- Create function to handle messages timestamp updates
CREATE OR REPLACE FUNCTION update_messages_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_messages_updated_at ON public.messages;
CREATE TRIGGER trigger_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_messages_updated_at();

-- Create function to update conversation metadata when message is added
CREATE OR REPLACE FUNCTION update_conversation_on_new_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.conversations
  SET 
    last_message_at = NEW.created_at,
    last_message_preview = LEFT(NEW.content, 100),
    updated_at = now()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update conversation metadata
DROP TRIGGER IF EXISTS trigger_update_conversation_on_new_message ON public.messages;
CREATE TRIGGER trigger_update_conversation_on_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_on_new_message();

-- Add comment to table
COMMENT ON TABLE public.messages IS 'Individual messages within conversations';
