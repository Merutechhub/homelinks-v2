-- Create post_comments table for feed post comments and discussions
-- Users can comment on feed posts

CREATE TABLE IF NOT EXISTS public.post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  
  -- Comment content
  content text NOT NULL,
  
  -- Reply to another comment (threaded comments)
  reply_to_comment_id uuid REFERENCES public.post_comments(id) ON DELETE CASCADE,
  
  -- Engagement
  like_count integer DEFAULT 0,
  
  -- Status
  is_edited boolean DEFAULT false,
  edited_at timestamp with time zone,
  is_deleted boolean DEFAULT false,
  deleted_at timestamp with time zone,
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT valid_content CHECK (char_length(content) > 0)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_author_id ON public.post_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_created_at ON public.post_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_post_comments_reply_to ON public.post_comments(reply_to_comment_id);

-- Row Level Security (RLS) Policies
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Anyone can view comments on public posts
CREATE POLICY "Anyone can view comments on public posts"
  ON public.post_comments
  FOR SELECT
  USING (
    NOT is_deleted AND
    EXISTS (
      SELECT 1 FROM public.feed_posts
      WHERE id = post_comments.post_id
      AND visibility = 'public'
      AND status = 'published'
    )
  );

-- Users can view comments on their own posts
CREATE POLICY "Users can view comments on own posts"
  ON public.post_comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.feed_posts
      WHERE id = post_comments.post_id
      AND author_id = auth.uid()
    )
  );

-- Users can create comments
CREATE POLICY "Users can create comments"
  ON public.post_comments
  FOR INSERT
  WITH CHECK (author_id = auth.uid());

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
  ON public.post_comments
  FOR UPDATE
  USING (author_id = auth.uid())
  WITH CHECK (author_id = auth.uid());

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
  ON public.post_comments
  FOR DELETE
  USING (author_id = auth.uid());

-- Create table for post likes
CREATE TABLE IF NOT EXISTS public.post_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.feed_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  created_at timestamp with time zone DEFAULT now(),
  
  UNIQUE(post_id, user_id)
);

-- Create indexes for post_likes
CREATE INDEX IF NOT EXISTS idx_post_likes_post_id ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_user_id ON public.post_likes(user_id);

-- Row Level Security for post_likes
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;

-- Anyone can view likes on public posts
CREATE POLICY "Anyone can view likes on public posts"
  ON public.post_likes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.feed_posts
      WHERE id = post_likes.post_id
      AND visibility = 'public'
      AND status = 'published'
    )
  );

-- Users can like posts
CREATE POLICY "Users can create likes"
  ON public.post_likes
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Users can unlike posts
CREATE POLICY "Users can delete own likes"
  ON public.post_likes
  FOR DELETE
  USING (user_id = auth.uid());

-- Create function to update post like count when like is added
CREATE OR REPLACE FUNCTION update_post_like_count_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.feed_posts
  SET like_count = like_count + 1
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for like count
DROP TRIGGER IF EXISTS trigger_post_like_count_insert ON public.post_likes;
CREATE TRIGGER trigger_post_like_count_insert
  AFTER INSERT ON public.post_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_like_count_on_insert();

-- Create function to update post like count when like is deleted
CREATE OR REPLACE FUNCTION update_post_like_count_on_delete()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.feed_posts
  SET like_count = like_count - 1
  WHERE id = OLD.post_id AND like_count > 0;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for like count deletion
DROP TRIGGER IF EXISTS trigger_post_like_count_delete ON public.post_likes;
CREATE TRIGGER trigger_post_like_count_delete
  AFTER DELETE ON public.post_likes
  FOR EACH ROW
  EXECUTE FUNCTION update_post_like_count_on_delete();

-- Create function to handle post_comments timestamp updates
CREATE OR REPLACE FUNCTION update_post_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_post_comments_updated_at ON public.post_comments;
CREATE TRIGGER trigger_post_comments_updated_at
  BEFORE UPDATE ON public.post_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comments_updated_at();

-- Create function to update comment count on feed posts when comment is added
CREATE OR REPLACE FUNCTION update_post_comment_count_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.feed_posts
  SET comment_count = comment_count + 1
  WHERE id = NEW.post_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for comment count
DROP TRIGGER IF EXISTS trigger_post_comment_count_insert ON public.post_comments;
CREATE TRIGGER trigger_post_comment_count_insert
  AFTER INSERT ON public.post_comments
  FOR EACH ROW
  EXECUTE FUNCTION update_post_comment_count_on_insert();

-- Add comments
COMMENT ON TABLE public.post_comments IS 'Comments on feed posts with threaded reply support';
COMMENT ON TABLE public.post_likes IS 'Likes on feed posts - tracks engagement';
