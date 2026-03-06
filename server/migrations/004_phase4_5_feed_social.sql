-- ============================================
-- MIGRATION 004: Phase 4-5 - Feed & Social
-- ============================================
-- Phase 4: Social Feed
-- Phase 5: Posts & Interactions
-- Status: Community engagement

-- 1. Posts
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  post_type TEXT DEFAULT 'text' CHECK (post_type IN ('text', 'image', 'link', 'event')),
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'friends', 'private')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'archived', 'removed', 'suspended')),
  moderation_status TEXT DEFAULT 'approved' CHECK (moderation_status IN ('approved', 'flagged', 'removed', 'suspended')),
  moderation_reason TEXT,
  moderated_by UUID REFERENCES auth.users(id),
  moderated_at TIMESTAMP,
  view_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "posts_user_view" ON public.posts FOR SELECT 
  USING (visibility = 'public' OR auth.uid() = user_id OR 
         moderation_status = 'approved' OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND primary_role = 'admin'));
CREATE POLICY "posts_user_create" ON public.posts FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_user_manage" ON public.posts FOR UPDATE 
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND primary_role = 'admin'))
  WITH CHECK (auth.uid() = user_id OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND primary_role = 'admin'));

CREATE INDEX idx_posts_user ON public.posts(user_id);
CREATE INDEX idx_posts_visibility ON public.posts(visibility);
CREATE INDEX idx_posts_status ON public.posts(status);
CREATE INDEX idx_posts_created ON public.posts(created_at);
CREATE INDEX idx_posts_moderation ON public.posts(moderation_status);

-- 2. Post Images/Media
CREATE TABLE IF NOT EXISTS public.post_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  media_url TEXT NOT NULL,
  media_type TEXT CHECK (media_type IN ('image', 'video', 'link')),
  display_order INT DEFAULT 0,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.post_media ENABLE ROW LEVEL SECURITY;
CREATE POLICY "post_media_public_view" ON public.post_media FOR SELECT USING (true);
CREATE POLICY "post_media_user_manage" ON public.post_media FOR ALL 
  USING (EXISTS (SELECT 1 FROM posts p WHERE p.id = post_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM posts p WHERE p.id = post_id AND p.user_id = auth.uid()));

CREATE INDEX idx_post_media_post ON public.post_media(post_id);

-- 3. Comments
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'approved' CHECK (status IN ('approved', 'flagged', 'removed', 'suspended')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comments_user_view" ON public.comments FOR SELECT 
  USING (status = 'approved' OR auth.uid() = user_id OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND primary_role = 'admin'));
CREATE POLICY "comments_user_create" ON public.comments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_user_manage" ON public.comments FOR UPDATE 
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_comments_post ON public.comments(post_id);
CREATE INDEX idx_comments_user ON public.comments(user_id);
CREATE INDEX idx_comments_created ON public.comments(created_at);

-- 4. Reactions/Likes
CREATE TABLE IF NOT EXISTS public.post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'haha', 'wow', 'sad', 'angry')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(post_id, user_id, reaction_type)
);

ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reactions_anyone_view" ON public.post_reactions FOR SELECT USING (true);
CREATE POLICY "reactions_user_manage" ON public.post_reactions FOR ALL 
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_post_reactions_post ON public.post_reactions(post_id);
CREATE INDEX idx_post_reactions_user ON public.post_reactions(user_id);

-- 5. Feed Cache (for performance optimization)
CREATE TABLE IF NOT EXISTS public.feed_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  rank DECIMAL(10, 6),
  score DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

ALTER TABLE public.feed_cache ENABLE ROW LEVEL SECURITY;
CREATE POLICY "feed_cache_user_view" ON public.feed_cache FOR SELECT 
  USING (auth.uid() = user_id);

CREATE INDEX idx_feed_cache_user ON public.feed_cache(user_id);
CREATE INDEX idx_feed_cache_rank ON public.feed_cache(user_id, rank DESC);

-- 6. Saved Posts
CREATE TABLE IF NOT EXISTS public.saved_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  saved_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

ALTER TABLE public.saved_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saved_posts_user_view" ON public.saved_posts FOR SELECT 
  USING (auth.uid() = user_id);
CREATE POLICY "saved_posts_user_manage" ON public.saved_posts FOR ALL 
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_saved_posts_user ON public.saved_posts(user_id);
