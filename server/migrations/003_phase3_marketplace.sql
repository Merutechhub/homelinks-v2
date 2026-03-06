-- ============================================
-- MIGRATION 003: Phase 3 - Marketplace
-- ============================================
-- Marketplace: Buy/sell items, categories, orders
-- Status: Core commerce feature

-- 1. Marketplace Listings
CREATE TABLE IF NOT EXISTS public.marketplace_listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INT DEFAULT 1,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'sold', 'removed', 'suspended')),
  condition TEXT CHECK (condition IN ('new', 'like_new', 'used', 'heavily_used')),
  tags TEXT[] DEFAULT '{}',
  views INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

ALTER TABLE public.marketplace_listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "listings_anyone_view_active" ON public.marketplace_listings FOR SELECT 
  USING (status = 'active' OR auth.uid() = seller_id OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND primary_role = 'admin'));
CREATE POLICY "listings_user_manage" ON public.marketplace_listings FOR ALL 
  USING (auth.uid() = seller_id OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND primary_role = 'admin'))
  WITH CHECK (auth.uid() = seller_id OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND primary_role = 'admin'));

CREATE INDEX idx_listings_seller ON public.marketplace_listings(seller_id);
CREATE INDEX idx_listings_category ON public.marketplace_listings(category);
CREATE INDEX idx_listings_status ON public.marketplace_listings(status);
CREATE INDEX idx_listings_created ON public.marketplace_listings(created_at);

-- 2. Listing Images
CREATE TABLE IF NOT EXISTS public.listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT false,
  uploaded_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY "listing_images_anyone_view" ON public.listing_images FOR SELECT USING (true);
CREATE POLICY "listing_images_seller_manage" ON public.listing_images FOR ALL 
  USING (EXISTS (SELECT 1 FROM marketplace_listings ml WHERE ml.id = listing_id AND ml.seller_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM marketplace_listings ml WHERE ml.id = listing_id AND ml.seller_id = auth.uid()));

CREATE INDEX idx_listing_images_listing ON public.listing_images(listing_id);

-- 3. Marketplace Orders
CREATE TABLE IF NOT EXISTS public.marketplace_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  seller_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  buyer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quantity INT NOT NULL DEFAULT 1,
  total_price DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'completed', 'cancelled', 'disputed')),
  payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'pending', 'paid', 'refunded')),
  shipping_address TEXT,
  tracking_number TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

ALTER TABLE public.marketplace_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "orders_user_view" ON public.marketplace_orders FOR SELECT 
  USING (auth.uid() = buyer_id OR auth.uid() = seller_id OR EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND primary_role = 'admin'));
CREATE POLICY "orders_user_create" ON public.marketplace_orders FOR INSERT 
  WITH CHECK (auth.uid() = buyer_id);
CREATE POLICY "orders_seller_update" ON public.marketplace_orders FOR UPDATE 
  USING (auth.uid() = seller_id OR auth.uid() = buyer_id)
  WITH CHECK (auth.uid() = seller_id OR auth.uid() = buyer_id);

CREATE INDEX idx_orders_seller ON public.marketplace_orders(seller_id);
CREATE INDEX idx_orders_buyer ON public.marketplace_orders(buyer_id);
CREATE INDEX idx_orders_listing ON public.marketplace_orders(listing_id);
CREATE INDEX idx_orders_status ON public.marketplace_orders(status);
CREATE INDEX idx_orders_created ON public.marketplace_orders(created_at);

-- 4. Order Messages/Tracking
CREATE TABLE IF NOT EXISTS public.order_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.marketplace_orders(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  message_type TEXT DEFAULT 'message' CHECK (message_type IN ('message', 'status_update', 'dispute')),
  created_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.order_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "order_msgs_user_view" ON public.order_messages FOR SELECT 
  USING (EXISTS (SELECT 1 FROM marketplace_orders mo WHERE mo.id = order_id AND (mo.buyer_id = auth.uid() OR mo.seller_id = auth.uid())));
CREATE POLICY "order_msgs_user_create" ON public.order_messages FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

CREATE INDEX idx_order_messages_order ON public.order_messages(order_id);
CREATE INDEX idx_order_messages_sender ON public.order_messages(sender_id);

-- 5. Wishlist/Saved Items
CREATE TABLE IF NOT EXISTS public.saved_marketplace_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES public.marketplace_listings(id) ON DELETE CASCADE,
  saved_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

ALTER TABLE public.saved_marketplace_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "saved_items_user_view" ON public.saved_marketplace_items FOR SELECT 
  USING (auth.uid() = user_id);
CREATE POLICY "saved_items_user_manage" ON public.saved_marketplace_items FOR ALL 
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_saved_items_user ON public.saved_marketplace_items(user_id);
CREATE INDEX idx_saved_items_listing ON public.saved_marketplace_items(listing_id);

-- 6. Marketplace Reviews
CREATE TABLE IF NOT EXISTS public.marketplace_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.marketplace_orders(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  title TEXT,
  comment TEXT,
  review_type TEXT CHECK (review_type IN ('buyer_to_seller', 'seller_to_buyer')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

ALTER TABLE public.marketplace_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_anyone_view" ON public.marketplace_reviews FOR SELECT USING (true);
CREATE POLICY "reviews_user_create" ON public.marketplace_reviews FOR INSERT 
  WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "reviews_reviewer_update" ON public.marketplace_reviews FOR UPDATE 
  USING (auth.uid() = reviewer_id) WITH CHECK (auth.uid() = reviewer_id);

CREATE INDEX idx_reviews_order ON public.marketplace_reviews(order_id);
CREATE INDEX idx_reviews_reviewer ON public.marketplace_reviews(reviewer_id);
CREATE INDEX idx_reviews_reviewee ON public.marketplace_reviews(reviewee_id);
