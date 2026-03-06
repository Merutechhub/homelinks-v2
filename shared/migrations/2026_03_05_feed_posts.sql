-- Create feed_posts table for community feed and discovery
-- Users can share updates, photos, and stories

CREATE TABLE IF NOT EXISTS public.feed_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Content
  content text,
  post_type text DEFAULT 'text' CHECK (post_type IN ('text', 'photo', 'video', 'listing', 'story')),
  
  -- Media
  images text[] DEFAULT '{}',
  videos text[] DEFAULT '{}',
  
  -- Related items
  related_listing_id uuid REFERENCES public.listings(id) ON DELETE SET NULL,
  related_marketplace_item_id uuid REFERENCES public.marketplace_items(id) ON DELETE SET NULL,
  
  -- Engagement
  like_count integer DEFAULT 0,
  comment_count integer DEFAULT 0,
  share_count integer DEFAULT 0,
  
  -- Privacy
  visibility text DEFAULT 'public' CHECK (visibility IN ('public', 'friends', 'private')),
  
  -- Status
  status text DEFAULT 'published' CHECK (status IN ('published', 'archived', 'deleted')),
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT valid_content CHECK (
    (post_type = 'text' AND content IS NOT NULL) OR
    (post_type != 'text' AND (array_length(images, 1) > 0 OR array_length(videos, 1) > 0))
  )
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_feed_posts_author_id ON public.feed_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_feed_posts_status ON public.feed_posts(status);
CREATE INDEX IF NOT EXISTS idx_feed_posts_created_at ON public.feed_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feed_posts_like_count ON public.feed_posts(like_count DESC);
CREATE INDEX IF NOT EXISTS idx_feed_posts_related_listing ON public.feed_posts(related_listing_id);
CREATE INDEX IF NOT EXISTS idx_feed_posts_related_marketplace ON public.feed_posts(related_marketplace_item_id);

-- Row Level Security (RLS) Policies
ALTER TABLE public.feed_posts ENABLE ROW LEVEL SECURITY;

-- Anyone can view public posts
CREATE POLICY "Anyone can view public posts"
  ON public.feed_posts
  FOR SELECT
  USING (visibility = 'public' AND status = 'published');

-- Users can view their own posts
CREATE POLICY "Users can view own posts"
  ON public.feed_posts
  FOR SELECT
  USING (auth.uid() = author_id);

-- Users can create posts
CREATE POLICY "Users can create posts"
  ON public.feed_posts
  FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Users can update their own posts
CREATE POLICY "Users can update own posts"
  ON public.feed_posts
  FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Users can delete their own posts
CREATE POLICY "Users can delete own posts"
  ON public.feed_posts
  FOR DELETE
  USING (auth.uid() = author_id);

-- Create function to handle feed_posts timestamp updates
CREATE OR REPLACE FUNCTION update_feed_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_feed_posts_updated_at ON public.feed_posts;
CREATE TRIGGER trigger_feed_posts_updated_at
  BEFORE UPDATE ON public.feed_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_feed_posts_updated_at();

-- Add comment to table
COMMENT ON TABLE public.feed_posts IS 'Community feed posts for sharing updates, photos, and discoveries';
