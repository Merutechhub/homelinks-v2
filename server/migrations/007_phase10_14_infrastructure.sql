-- ============================================
-- MIGRATION 007: Phase 10-14 - Infrastructure
-- ============================================
-- Phase 10: Feed Ranking Algorithm
-- Phase 11-14: Core Infrastructure
-- Status: Performance & notifications

-- 1. Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES auth.users(id),
  notification_type TEXT NOT NULL CHECK (notification_type IN ('message', 'order', 'application', 'review', 'listing', 'follow', 'alert')),
  title TEXT NOT NULL,
  content TEXT,
  related_id UUID,
  is_read BOOLEAN DEFAULT false,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '30 days'
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_user_view" ON public.notifications FOR SELECT 
  USING (auth.uid() = user_id);
CREATE POLICY "notifications_user_manage" ON public.notifications FOR UPDATE 
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_notifications_user ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(user_id, is_read);
CREATE INDEX idx_notifications_created ON public.notifications(created_at);

-- 2. Push Notification Subscriptions
CREATE TABLE IF NOT EXISTS public.device_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  device_token TEXT NOT NULL,
  device_type TEXT CHECK (device_type IN ('web', 'ios', 'android')),
  device_name TEXT,
  is_active BOOLEAN DEFAULT true,
  registered_at TIMESTAMP DEFAULT NOW(),
  last_used_at TIMESTAMP,
  UNIQUE(user_id, device_token)
);

ALTER TABLE public.device_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "device_tokens_user_manage" ON public.device_tokens FOR ALL 
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_device_tokens_user ON public.device_tokens(user_id);
CREATE INDEX idx_device_tokens_active ON public.device_tokens(is_active);

-- 3. User Activity Log (for analytics & ranking)
CREATE TABLE IF NOT EXISTS public.user_activity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('view', 'click', 'like', 'comment', 'share', 'purchase', 'create', 'message')),
  entity_type TEXT NOT NULL,
  entity_id UUID,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.user_activity ENABLE ROW LEVEL SECURITY;
CREATE POLICY "activity_user_view" ON public.user_activity FOR SELECT 
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND primary_role = 'admin'));
CREATE POLICY "activity_user_create" ON public.user_activity FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_activity_user ON public.user_activity(user_id);
CREATE INDEX idx_activity_type ON public.user_activity(activity_type);
CREATE INDEX idx_activity_entity ON public.user_activity(entity_type, entity_id);
CREATE INDEX idx_activity_created ON public.user_activity(created_at);

-- 4. Saved Items (general wishlist)
CREATE TABLE IF NOT EXISTS public.saved_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('listing', 'housing', 'post', 'meal')),
  item_id UUID NOT NULL,
  saved_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, item_type, item_id)
);

ALTER TABLE public.saved_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saved_items_user_view" ON public.saved_items FOR SELECT 
  USING (auth.uid() = user_id);
CREATE POLICY "saved_items_user_manage" ON public.saved_items FOR ALL 
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_saved_items_user ON public.saved_items(user_id);
CREATE INDEX idx_saved_items_entity ON public.saved_items(item_type, item_id);

-- 5. Search History (for recommendation engine)
CREATE TABLE IF NOT EXISTS public.search_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  search_query TEXT NOT NULL,
  search_type TEXT CHECK (search_type IN ('housing', 'marketplace', 'meals', 'users')),
  results_count INT DEFAULT 0,
  searched_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.search_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "search_history_user_view" ON public.search_history FOR SELECT 
  USING (auth.uid() = user_id);
CREATE POLICY "search_history_user_create" ON public.search_history FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_search_history_user ON public.search_history(user_id);
CREATE INDEX idx_search_history_type ON public.search_history(search_type);
CREATE INDEX idx_search_history_searched ON public.search_history(searched_at);

-- 6. User Preferences
CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  marketing_emails BOOLEAN DEFAULT true,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark', 'auto')),
  language TEXT DEFAULT 'en',
  privacy_level TEXT DEFAULT 'public' CHECK (privacy_level IN ('public', 'friends', 'private')),
  show_online_status BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "preferences_user_manage" ON public.user_preferences FOR ALL 
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_preferences_user ON public.user_preferences(user_id);

-- 7. Platform Statistics (for admin dashboard)
CREATE TABLE IF NOT EXISTS public.platform_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stat_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_users INT DEFAULT 0,
  active_users INT DEFAULT 0,
  total_listings INT DEFAULT 0,
  total_orders INT DEFAULT 0,
  total_revenue DECIMAL(15, 2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(stat_date)
);

ALTER TABLE public.platform_stats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "platform_stats_admin_view" ON public.platform_stats FOR SELECT 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND primary_role = 'admin'));

CREATE INDEX idx_platform_stats_date ON public.platform_stats(stat_date);

-- 8. Flagged Content (moderation queue)
CREATE TABLE IF NOT EXISTS public.flagged_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_type TEXT NOT NULL CHECK (content_type IN ('post', 'listing', 'comment', 'message', 'profile', 'ad')),
  content_id UUID NOT NULL,
  flagged_by UUID NOT NULL REFERENCES auth.users(id),
  reason TEXT NOT NULL,
  severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  resolution TEXT,
  resolved_by UUID REFERENCES auth.users(id),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.flagged_content ENABLE ROW LEVEL SECURITY;
CREATE POLICY "flagged_content_user_view" ON public.flagged_content FOR SELECT 
  USING (auth.uid() = flagged_by OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND primary_role = 'admin'));
CREATE POLICY "flagged_content_user_create" ON public.flagged_content FOR INSERT 
  WITH CHECK (auth.uid() = flagged_by);
CREATE POLICY "flagged_content_admin_manage" ON public.flagged_content FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND primary_role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND primary_role = 'admin'));

CREATE INDEX idx_flagged_content_type ON public.flagged_content(content_type, content_id);
CREATE INDEX idx_flagged_content_status ON public.flagged_content(status);
CREATE INDEX idx_flagged_content_severity ON public.flagged_content(severity);
CREATE INDEX idx_flagged_content_created ON public.flagged_content(created_at);

-- 9. Reports
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES auth.users(id),
  report_type TEXT NOT NULL CHECK (report_type IN ('user', 'listing', 'post', 'comment', 'message')),
  report_reason TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  created_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reports_admin_view" ON public.reports FOR SELECT 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND primary_role = 'admin'));
CREATE POLICY "reports_user_create" ON public.reports FOR INSERT 
  WITH CHECK (auth.uid() = reporter_id);

CREATE INDEX idx_reports_reporter ON public.reports(reporter_id);
CREATE INDEX idx_reports_reported_user ON public.reports(reported_user_id);
CREATE INDEX idx_reports_status ON public.reports(status);
CREATE INDEX idx_reports_created ON public.reports(created_at);

-- 10. API Usage Tracking (for rate limiting & analytics)
CREATE TABLE IF NOT EXISTS public.api_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  endpoint TEXT NOT NULL,
  method TEXT NOT NULL,
  status_code INT,
  response_time_ms INT,
  ip_address INET,
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.api_usage ENABLE ROW LEVEL SECURITY;
CREATE POLICY "api_usage_admin_view" ON public.api_usage FOR SELECT 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND primary_role = 'admin'));
CREATE INDEX idx_api_usage_user ON public.api_usage(user_id);
CREATE INDEX idx_api_usage_endpoint ON public.api_usage(endpoint);
CREATE INDEX idx_api_usage_created ON public.api_usage(created_at);
