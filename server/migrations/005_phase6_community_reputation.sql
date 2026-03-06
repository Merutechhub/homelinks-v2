-- ============================================
-- MIGRATION 005: Phase 6 - Community & Reputation
-- ============================================
-- Community: User profiles, badges, reputation
-- Status: Trust & verification system

-- 1. User Badges
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_type TEXT NOT NULL,
  badge_name TEXT NOT NULL,
  badge_icon TEXT,
  badge_color TEXT,
  description TEXT,
  unlocked_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, badge_type)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "badges_anyone_view" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "badges_admin_manage" ON public.user_badges FOR ALL 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND primary_role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND primary_role = 'admin'));

CREATE INDEX idx_user_badges_user ON public.user_badges(user_id);
CREATE INDEX idx_user_badges_type ON public.user_badges(badge_type);

-- 2. User Reputation Scores
CREATE TABLE IF NOT EXISTS public.user_reputation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  overall_rating DECIMAL(3, 2) DEFAULT 0,
  total_ratings INT DEFAULT 0,
  seller_rating DECIMAL(3, 2) DEFAULT 0,
  seller_ratings INT DEFAULT 0,
  landlord_rating DECIMAL(3, 2) DEFAULT 0,
  landlord_ratings INT DEFAULT 0,
  buyer_rating DECIMAL(3, 2) DEFAULT 0,
  buyer_ratings INT DEFAULT 0,
  response_time_hours INT DEFAULT 0,
  completion_rate DECIMAL(5, 2) DEFAULT 100,
  dispute_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.user_reputation ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reputation_anyone_view" ON public.user_reputation FOR SELECT USING (true);
CREATE POLICY "reputation_admin_manage" ON public.user_reputation FOR ALL 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND primary_role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND primary_role = 'admin'));

CREATE INDEX idx_reputation_user ON public.user_reputation(user_id);
CREATE INDEX idx_reputation_overall ON public.user_reputation(overall_rating);

-- 3. Entity Comments (for marketplace, housing, etc)
CREATE TABLE IF NOT EXISTS public.entity_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('listing', 'housing', 'profile', 'post')),
  entity_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status TEXT DEFAULT 'approved' CHECK (status IN ('approved', 'flagged', 'removed')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.entity_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "entity_comments_view" ON public.entity_comments FOR SELECT 
  USING (status = 'approved' OR auth.uid() = user_id OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND primary_role = 'admin'));
CREATE POLICY "entity_comments_create" ON public.entity_comments FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "entity_comments_manage" ON public.entity_comments FOR UPDATE 
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_entity_comments_entity ON public.entity_comments(entity_type, entity_id);
CREATE INDEX idx_entity_comments_user ON public.entity_comments(user_id);
CREATE INDEX idx_entity_comments_status ON public.entity_comments(status);

-- 4. Entity Reactions (for listings, posts, etc)
CREATE TABLE IF NOT EXISTS public.entity_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('listing', 'housing', 'post', 'comment')),
  entity_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'haha', 'wow', 'sad', 'angry')),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(entity_type, entity_id, user_id, reaction_type)
);

ALTER TABLE public.entity_reactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "entity_reactions_anyone_view" ON public.entity_reactions FOR SELECT USING (true);
CREATE POLICY "entity_reactions_user_manage" ON public.entity_reactions FOR ALL 
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_entity_reactions_entity ON public.entity_reactions(entity_type, entity_id);
CREATE INDEX idx_entity_reactions_user ON public.entity_reactions(user_id);

-- 5. Verification Documents
CREATE TABLE IF NOT EXISTS public.verification_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  verification_type TEXT NOT NULL CHECK (verification_type IN ('school_email', 'id_verification', 'phone_verification', 'background_check', 'bank_account')),
  document_url TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
  verified_at TIMESTAMP,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "verification_docs_user_view" ON public.verification_documents FOR SELECT 
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND primary_role = 'admin'));
CREATE POLICY "verification_docs_user_create" ON public.verification_documents FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "verification_docs_admin_update" ON public.verification_documents FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND primary_role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND primary_role = 'admin'));

CREATE INDEX idx_verification_docs_user ON public.verification_documents(user_id);
CREATE INDEX idx_verification_docs_type ON public.verification_documents(verification_type);
CREATE INDEX idx_verification_docs_status ON public.verification_documents(status);

-- 6. User Following (friendship/follow system)
CREATE TABLE IF NOT EXISTS public.user_follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_blocked BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

ALTER TABLE public.user_follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "follows_anyone_view" ON public.user_follows FOR SELECT 
  USING (is_blocked = false OR auth.uid() IN (follower_id, following_id));
CREATE POLICY "follows_user_manage" ON public.user_follows FOR ALL 
  USING (auth.uid() = follower_id) WITH CHECK (auth.uid() = follower_id);

CREATE INDEX idx_follows_follower ON public.user_follows(follower_id);
CREATE INDEX idx_follows_following ON public.user_follows(following_id);
