-- Create marketplace_items table for P2P marketplace listings
-- Users can buy and sell items on the platform

CREATE TABLE IF NOT EXISTS public.marketplace_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Item details
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  price numeric(12, 2) NOT NULL CHECK (price >= 0),
  condition text NOT NULL CHECK (condition IN ('new', 'like-new', 'good', 'fair', 'poor')),
  location text NOT NULL,
  tags text[] DEFAULT '{}',
  
  -- Images
  images text[] DEFAULT '{}',
  
  -- Shipping and negotiation
  shipping_available boolean DEFAULT false,
  negotiable boolean DEFAULT true,
  
  -- Engagement metrics
  view_count integer DEFAULT 0,
  favorite_count integer DEFAULT 0,
  
  -- Status tracking
  status text DEFAULT 'available' CHECK (status IN ('available', 'sold', 'reserved', 'delisted')),
  sold_at timestamp with time zone,
  sold_to_user_id uuid REFERENCES auth.users(id),
  
  -- Metadata
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT valid_title CHECK (char_length(title) > 0 AND char_length(title) <= 200),
  CONSTRAINT valid_description CHECK (char_length(description) > 0)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_marketplace_items_seller_id ON public.marketplace_items(seller_id);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_category ON public.marketplace_items(category);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_status ON public.marketplace_items(status);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_created_at ON public.marketplace_items(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_price ON public.marketplace_items(price);
CREATE INDEX IF NOT EXISTS idx_marketplace_items_view_count ON public.marketplace_items(view_count DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE public.marketplace_items ENABLE ROW LEVEL SECURITY;

-- Anyone can view available items
CREATE POLICY "Anyone can view available items"
  ON public.marketplace_items
  FOR SELECT
  USING (status = 'available' OR auth.uid() = seller_id);

-- Sellers can insert their own items
CREATE POLICY "Sellers can insert own items"
  ON public.marketplace_items
  FOR INSERT
  WITH CHECK (auth.uid() = seller_id);

-- Sellers can update their own items
CREATE POLICY "Sellers can update own items"
  ON public.marketplace_items
  FOR UPDATE
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

-- Sellers can delete their own items
CREATE POLICY "Sellers can delete own items"
  ON public.marketplace_items
  FOR DELETE
  USING (auth.uid() = seller_id);

-- Create function to handle marketplace_items timestamp updates
CREATE OR REPLACE FUNCTION update_marketplace_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_marketplace_items_updated_at ON public.marketplace_items;
CREATE TRIGGER trigger_marketplace_items_updated_at
  BEFORE UPDATE ON public.marketplace_items
  FOR EACH ROW
  EXECUTE FUNCTION update_marketplace_items_updated_at();

-- Add comment to table
COMMENT ON TABLE public.marketplace_items IS 'Peer-to-peer marketplace listings - users can buy and sell items';
