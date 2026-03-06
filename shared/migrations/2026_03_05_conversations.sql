-- Create conversations table for direct messaging
-- Stores conversation metadata and participants

CREATE TABLE IF NOT EXISTS public.conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Participants
  user_1_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  user_2_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Relationship to listing/item (optional)
  related_item_type text CHECK (related_item_type IN ('property', 'marketplace-item', NULL)),
  related_item_id uuid,
  
  -- Conversation metadata
  subject text,
  last_message_at timestamp with time zone DEFAULT now(),
  last_message_preview text,
  
  -- User-specific metadata
  user_1_last_read_at timestamp with time zone DEFAULT now(),
  user_2_last_read_at timestamp with time zone DEFAULT now(),
  user_1_archived_at timestamp with time zone,
  user_2_archived_at timestamp with time zone,
  
  -- Status
  is_active boolean DEFAULT true,
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT different_users CHECK (user_1_id < user_2_id),
  CONSTRAINT valid_subject CHECK (char_length(subject) > 0 AND char_length(subject) <= 255)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_conversations_user_1_id ON public.conversations(user_1_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user_2_id ON public.conversations(user_2_id);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_conversations_related_item ON public.conversations(related_item_type, related_item_id);

-- Row Level Security (RLS) Policies
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;

-- Users can only view their own conversations
CREATE POLICY "Users can view own conversations"
  ON public.conversations
  FOR SELECT
  USING (auth.uid() = user_1_id OR auth.uid() = user_2_id);

-- Users can create conversations with others
CREATE POLICY "Users can create conversations"
  ON public.conversations
  FOR INSERT
  WITH CHECK (auth.uid() IN (user_1_id, user_2_id));

-- Users can update their own conversations
CREATE POLICY "Users can update own conversations"
  ON public.conversations
  FOR UPDATE
  USING (auth.uid() IN (user_1_id, user_2_id))
  WITH CHECK (auth.uid() IN (user_1_id, user_2_id));

-- Create function to handle conversations timestamp updates
CREATE OR REPLACE FUNCTION update_conversations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_conversations_updated_at ON public.conversations;
CREATE TRIGGER trigger_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_conversations_updated_at();

-- Add comment to table
COMMENT ON TABLE public.conversations IS 'Direct messaging conversations between two users';
