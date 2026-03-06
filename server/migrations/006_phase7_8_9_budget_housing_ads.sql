-- ============================================
-- MIGRATION 006: Phase 7-9 - Budget Bite, Housing, Ads
-- ============================================
-- Phase 7: Budget Bite (meal sharing)
-- Phase 8: Housing (property listings)
-- Phase 9: Ads (monetization)

-- ============ PHASE 7: BUDGET BITE ============

-- 1. Meals
CREATE TABLE IF NOT EXISTS public.meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chef_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  cuisine_type TEXT,
  servings INT NOT NULL DEFAULT 1,
  price_per_serving DECIMAL(8, 2) NOT NULL,
  available_quantity INT NOT NULL DEFAULT 0,
  preparation_time_minutes INT,
  cooking_difficulty TEXT CHECK (cooking_difficulty IN ('easy', 'medium', 'hard')),
  dietary_info TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'sold_out', 'removed', 'archived')),
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.meals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "meals_anyone_view" ON public.meals FOR SELECT 
  USING (status IN ('available', 'sold_out') OR auth.uid() = chef_id OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND primary_role = 'admin'));
CREATE POLICY "meals_chef_manage" ON public.meals FOR ALL 
  USING (auth.uid() = chef_id) WITH CHECK (auth.uid() = chef_id);

CREATE INDEX idx_meals_chef ON public.meals(chef_id);
CREATE INDEX idx_meals_status ON public.meals(status);
CREATE INDEX idx_meals_cuisine ON public.meals(cuisine_type);

-- 2. Meal Ingredients
CREATE TABLE IF NOT EXISTS public.meal_ingredients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id UUID NOT NULL REFERENCES public.meals(id) ON DELETE CASCADE,
  ingredient_name TEXT NOT NULL,
  quantity DECIMAL(10, 2),
  unit TEXT,
  cost DECIMAL(8, 2)
);

ALTER TABLE public.meal_ingredients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "meal_ingredients_anyone_view" ON public.meal_ingredients FOR SELECT USING (true);
CREATE POLICY "meal_ingredients_chef_manage" ON public.meal_ingredients FOR ALL 
  USING (EXISTS (SELECT 1 FROM meals m WHERE m.id = meal_id AND m.chef_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM meals m WHERE m.id = meal_id AND m.chef_id = auth.uid()));

CREATE INDEX idx_meal_ingredients_meal ON public.meal_ingredients(meal_id);

-- 3. Meal Orders
CREATE TABLE IF NOT EXISTS public.meal_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_id UUID NOT NULL REFERENCES public.meals(id) ON DELETE CASCADE,
  chef_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quantity INT NOT NULL,
  total_price DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'ready', 'picked_up', 'cancelled')),
  pickup_date DATE,
  pickup_time TIME,
  delivery_address TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

ALTER TABLE public.meal_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "meal_orders_user_view" ON public.meal_orders FOR SELECT 
  USING (auth.uid() = buyer_id OR auth.uid() = chef_id OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND primary_role = 'admin'));
CREATE POLICY "meal_orders_buyer_create" ON public.meal_orders FOR INSERT 
  WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "meal_orders_manage" ON public.meal_orders FOR UPDATE 
  USING (auth.uid() = buyer_id OR auth.uid() = chef_id)
  WITH CHECK (auth.uid() = buyer_id OR auth.uid() = chef_id);

CREATE INDEX idx_meal_orders_meal ON public.meal_orders(meal_id);
CREATE INDEX idx_meal_orders_chef ON public.meal_orders(chef_id);
CREATE INDEX idx_meal_orders_buyer ON public.meal_orders(buyer_id);
CREATE INDEX idx_meal_orders_status ON public.meal_orders(status);

-- 4. Cooking Logs/Tracking
CREATE TABLE IF NOT EXISTS public.cooking_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  meal_name TEXT NOT NULL,
  servings INT,
  calories DECIMAL(8, 2),
  cost DECIMAL(8, 2),
  time_spent_minutes INT,
  notes TEXT,
  logged_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.cooking_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "cooking_logs_user_view" ON public.cooking_logs FOR SELECT 
  USING (auth.uid() = user_id);
CREATE POLICY "cooking_logs_user_manage" ON public.cooking_logs FOR ALL 
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_cooking_logs_user ON public.cooking_logs(user_id);
CREATE INDEX idx_cooking_logs_logged ON public.cooking_logs(logged_at);

-- ============ PHASE 8: HOUSING ============

-- 1. Housing Listings
CREATE TABLE IF NOT EXISTS public.housing_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  landlord_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  address TEXT NOT NULL,
  city TEXT,
  state TEXT,
  zip_code TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  property_type TEXT CHECK (property_type IN ('apartment', 'house', 'room', 'shared')),
  bedrooms INT,
  bathrooms DECIMAL(3, 1),
  square_feet INT,
  rent_price DECIMAL(10, 2) NOT NULL,
  deposit_required DECIMAL(10, 2),
  lease_term_months INT[] DEFAULT '{12}',
  furnished BOOLEAN DEFAULT false,
  utilities_included TEXT[],
  amenities TEXT[] DEFAULT '{}',
  pet_friendly BOOLEAN DEFAULT false,
  available_from DATE,
  status TEXT DEFAULT 'available' CHECK (status IN ('available', 'rented', 'removed', 'suspended')),
  image_count INT DEFAULT 0,
  view_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.housing_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "housing_anyone_view" ON public.housing_listings FOR SELECT 
  USING (status IN ('available', 'rented') OR auth.uid() = landlord_id OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND primary_role = 'admin'));
CREATE POLICY "housing_landlord_manage" ON public.housing_listings FOR ALL 
  USING (auth.uid() = landlord_id OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND primary_role = 'admin'))
  WITH CHECK (auth.uid() = landlord_id OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND primary_role = 'admin'));

CREATE INDEX idx_housing_landlord ON public.housing_listings(landlord_id);
CREATE INDEX idx_housing_city ON public.housing_listings(city);
CREATE INDEX idx_housing_status ON public.housing_listings(status);
CREATE INDEX idx_housing_created ON public.housing_listings(created_at);

-- 2. Housing Images
CREATE TABLE IF NOT EXISTS public.housing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.housing_listings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.housing_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "housing_images_anyone_view" ON public.housing_images FOR SELECT USING (true);
CREATE POLICY "housing_images_landlord_manage" ON public.housing_images FOR ALL 
  USING (EXISTS (SELECT 1 FROM housing_listings hl WHERE hl.id = listing_id AND hl.landlord_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM housing_listings hl WHERE hl.id = listing_id AND hl.landlord_id = auth.uid()));

CREATE INDEX idx_housing_images_listing ON public.housing_images(listing_id);

-- 3. Housing Applications
CREATE TABLE IF NOT EXISTS public.housing_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.housing_listings(id) ON DELETE CASCADE,
  landlord_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  renter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'withdrawn')),
  move_in_date DATE,
  lease_term_months INT,
  cover_letter TEXT,
  employment_status TEXT,
  monthly_income DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.housing_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "housing_apps_user_view" ON public.housing_applications FOR SELECT 
  USING (auth.uid() = renter_id OR auth.uid() = landlord_id OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND primary_role = 'admin'));
CREATE POLICY "housing_apps_renter_create" ON public.housing_applications FOR INSERT 
  WITH CHECK (auth.uid() = renter_id);
CREATE POLICY "housing_apps_manage" ON public.housing_applications FOR UPDATE 
  USING (auth.uid() = renter_id OR auth.uid() = landlord_id)
  WITH CHECK (auth.uid() = renter_id OR auth.uid() = landlord_id);

CREATE INDEX idx_housing_apps_listing ON public.housing_applications(listing_id);
CREATE INDEX idx_housing_apps_landlord ON public.housing_applications(landlord_id);
CREATE INDEX idx_housing_apps_renter ON public.housing_applications(renter_id);
CREATE INDEX idx_housing_apps_status ON public.housing_applications(status);

-- 4. Housing Reviews
CREATE TABLE IF NOT EXISTS public.housing_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.housing_listings(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  landlord_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  comment TEXT,
  condition_rating INT CHECK (condition_rating BETWEEN 1 AND 5),
  landlord_response_rating INT CHECK (landlord_response_rating BETWEEN 1 AND 5),
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.housing_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "housing_reviews_anyone_view" ON public.housing_reviews FOR SELECT USING (true);
CREATE POLICY "housing_reviews_user_create" ON public.housing_reviews FOR INSERT 
  WITH CHECK (auth.uid() = reviewer_id);

CREATE INDEX idx_housing_reviews_listing ON public.housing_reviews(listing_id);
CREATE INDEX idx_housing_reviews_reviewer ON public.housing_reviews(reviewer_id);
CREATE INDEX idx_housing_reviews_landlord ON public.housing_reviews(landlord_id);

-- ============ PHASE 9: ADS ============

-- 1. Ads
CREATE TABLE IF NOT EXISTS public.ads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  advertiser_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  ad_type TEXT CHECK (ad_type IN ('banner', 'video', 'native', 'popup')),
  target_audience TEXT[] DEFAULT '{}',
  image_url TEXT,
  landing_url TEXT NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'paused', 'expired', 'removed')),
  budget DECIMAL(10, 2),
  spent DECIMAL(10, 2) DEFAULT 0,
  start_date TIMESTAMP,
  end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.ads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ads_public_view" ON public.ads FOR SELECT 
  USING (status IN ('active', 'paused') OR auth.uid() = advertiser_id OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND primary_role = 'admin'));
CREATE POLICY "ads_advertiser_manage" ON public.ads FOR ALL 
  USING (auth.uid() = advertiser_id OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND primary_role = 'admin'))
  WITH CHECK (auth.uid() = advertiser_id OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND primary_role = 'admin'));

CREATE INDEX idx_ads_advertiser ON public.ads(advertiser_id);
CREATE INDEX idx_ads_status ON public.ads(status);
CREATE INDEX idx_ads_created ON public.ads(created_at);

-- 2. Ad Impressions
CREATE TABLE IF NOT EXISTS public.ad_impressions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  impression_timestamp TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.ad_impressions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "impressions_admin_view" ON public.ad_impressions FOR SELECT 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND primary_role = 'admin'));

CREATE INDEX idx_impressions_ad ON public.ad_impressions(ad_id);
CREATE INDEX idx_impressions_timestamp ON public.ad_impressions(impression_timestamp);

-- 3. Ad Clicks
CREATE TABLE IF NOT EXISTS public.ad_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ad_id UUID NOT NULL REFERENCES public.ads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  click_timestamp TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.ad_clicks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "clicks_admin_view" ON public.ad_clicks FOR SELECT 
  USING (EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND primary_role = 'admin'));

CREATE INDEX idx_clicks_ad ON public.ad_clicks(ad_id);
CREATE INDEX idx_clicks_timestamp ON public.ad_clicks(click_timestamp);
