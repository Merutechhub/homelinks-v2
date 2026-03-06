-- ============================================
-- MIGRATION 001: Core Tables & Auth
-- ============================================
-- Phase 0: Core infrastructure
-- Tables: profiles, images, roles
-- Status: Foundation for all other features

-- 1. Core Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  phone TEXT,
  verified BOOLEAN DEFAULT false,
  verification_type TEXT,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_anyone_view" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_user_update" ON public.profiles FOR UPDATE 
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_user_insert" ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

CREATE INDEX idx_profiles_username ON public.profiles(username);
CREATE INDEX idx_profiles_verified ON public.profiles(verified);
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- 2. Core Images/Media Table (for all image storage references)
CREATE TABLE IF NOT EXISTS public.media_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'video', 'document')),
  file_size INT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  upload_timestamp TIMESTAMP DEFAULT NOW(),
  is_primary BOOLEAN DEFAULT false
);

ALTER TABLE public.media_uploads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "media_anyone_view" ON public.media_uploads FOR SELECT USING (true);
CREATE POLICY "media_user_manage" ON public.media_uploads FOR ALL 
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_media_user ON public.media_uploads(user_id);
CREATE INDEX idx_media_entity ON public.media_uploads(entity_type, entity_id);
CREATE INDEX idx_media_uploaded ON public.media_uploads(upload_timestamp);

-- 3. User Role System Tables
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  primary_role TEXT NOT NULL CHECK (primary_role IN ('admin', 'renter', 'landlord', 'seller')),
  secondary_roles TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_roles_view_own" ON public.user_roles FOR SELECT 
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.primary_role = 'admin'));
CREATE POLICY "user_roles_update_admin" ON public.user_roles FOR UPDATE 
  USING (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.primary_role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.primary_role = 'admin'));

CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_primary ON public.user_roles(primary_role);

-- 4. Role Permissions Matrix
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL UNIQUE,
  permissions JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "role_perms_anyone_view" ON public.role_permissions FOR SELECT USING (true);
CREATE POLICY "role_perms_admin_manage" ON public.role_permissions FOR ALL 
  USING (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.primary_role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.primary_role = 'admin'));

-- 5. Role Audit Log
CREATE TABLE IF NOT EXISTS public.role_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  role_from TEXT,
  role_to TEXT,
  metadata JSONB,
  changed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.role_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "audit_log_admin_view" ON public.role_audit_log FOR SELECT 
  USING (EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = auth.uid() AND ur.primary_role = 'admin'));

CREATE INDEX idx_audit_log_user ON public.role_audit_log(user_id);
CREATE INDEX idx_audit_log_created ON public.role_audit_log(created_at);

-- 6. Role-specific profiles (will be populated by other migrations)
CREATE TABLE IF NOT EXISTS public.renter_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  school_name TEXT,
  graduation_year INT,
  gpa DECIMAL(3, 2),
  preferred_locations TEXT[] DEFAULT '{}',
  budget_max DECIMAL(10, 2),
  move_in_date DATE,
  lease_preference TEXT[] DEFAULT '{"12 months"}',
  dietary_restrictions TEXT[] DEFAULT '{}',
  cooking_frequency INT DEFAULT 0,
  meal_budget DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.renter_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "renter_view_own" ON public.renter_profile FOR SELECT 
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND primary_role = 'admin'));
CREATE POLICY "renter_manage_own" ON public.renter_profile FOR ALL 
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_renter_user ON public.renter_profile(user_id);
CREATE INDEX idx_renter_locations ON public.renter_profile USING GIN(preferred_locations);

CREATE TABLE IF NOT EXISTS public.landlord_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  company_name TEXT,
  phone_verified BOOLEAN DEFAULT false,
  background_check_passed BOOLEAN DEFAULT false,
  properties_count INT DEFAULT 0,
  total_rating DECIMAL(3, 2) DEFAULT 0,
  average_response_time INT,
  is_professional BOOLEAN DEFAULT false,
  bank_account_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.landlord_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "landlord_view_own" ON public.landlord_profile FOR SELECT 
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND primary_role = 'admin'));
CREATE POLICY "landlord_manage_own" ON public.landlord_profile FOR ALL 
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_landlord_user ON public.landlord_profile(user_id);
CREATE INDEX idx_landlord_verified ON public.landlord_profile(background_check_passed);

CREATE TABLE IF NOT EXISTS public.seller_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT,
  store_category TEXT[] DEFAULT '{}',
  total_sales DECIMAL(12, 2) DEFAULT 0,
  total_orders INT DEFAULT 0,
  total_rating DECIMAL(3, 2) DEFAULT 0,
  accepts_shipping BOOLEAN DEFAULT true,
  shipping_radius INT DEFAULT 10,
  bank_account_verified BOOLEAN DEFAULT false,
  store_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.seller_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "seller_view_own" ON public.seller_profile FOR SELECT 
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND primary_role = 'admin'));
CREATE POLICY "seller_manage_own" ON public.seller_profile FOR ALL 
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_seller_user ON public.seller_profile(user_id);
CREATE INDEX idx_seller_verified ON public.seller_profile(store_verified);

CREATE TABLE IF NOT EXISTS public.admin_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_level INT NOT NULL DEFAULT 1 CHECK (admin_level BETWEEN 1 AND 5),
  verified_at TIMESTAMP,
  permissions JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.admin_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin_view_own" ON public.admin_profile FOR SELECT 
  USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM admin_profile WHERE user_id = auth.uid() AND admin_level >= 4));
CREATE POLICY "admin_manage_system" ON public.admin_profile FOR ALL 
  USING (EXISTS (SELECT 1 FROM admin_profile WHERE user_id = auth.uid() AND admin_level = 5))
  WITH CHECK (EXISTS (SELECT 1 FROM admin_profile WHERE user_id = auth.uid() AND admin_level = 5));

CREATE INDEX idx_admin_user ON public.admin_profile(user_id);
CREATE INDEX idx_admin_level ON public.admin_profile(admin_level);

-- 7. Default role permissions
INSERT INTO role_permissions (role, permissions) VALUES
('renter', '{
  "browse_housing": true,
  "apply_housing": true,
  "browse_marketplace": true,
  "browse_meals": true,
  "message_landlord": true,
  "message_seller": true,
  "leave_reviews": true
}'::jsonb),
('landlord', '{
  "list_housing": true,
  "manage_housing": true,
  "verify_tenants": true,
  "view_applications": true,
  "message_renters": true,
  "process_payments": true,
  "upload_images": true
}'::jsonb),
('seller', '{
  "create_listings": true,
  "manage_inventory": true,
  "list_meals": true,
  "manage_orders": true,
  "accept_payments": true,
  "upload_images": true,
  "message_customers": true,
  "arrange_shipping": true
}'::jsonb),
('admin', '{
  "manageUsers": true,
  "manageListings": true,
  "managePosts": true,
  "manageAds": true,
  "viewAnalytics": true,
  "viewAuditLog": true,
  "managePlatformSettings": true,
  "manageModerators": true
}'::jsonb)
ON CONFLICT (role) DO NOTHING;
