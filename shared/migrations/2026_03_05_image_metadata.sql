-- Create image_metadata table for tracking uploaded images
-- Used by: Housing listings, Marketplace items, Profiles, Community posts

CREATE TABLE IF NOT EXISTS public.image_metadata (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Image identification
  public_id text NOT NULL UNIQUE,
  secure_url text NOT NULL,
  original_filename text NOT NULL,
  mime_type text NOT NULL DEFAULT 'image/jpeg',
  file_size_bytes integer,
  
  -- Entity relationship
  entity_type text NOT NULL CHECK (entity_type IN ('property', 'marketplace-item', 'profile', 'community-post')),
  entity_id uuid NOT NULL,
  
  -- Metadata
  width integer,
  height integer,
  aspect_ratio numeric(5, 2),
  dominant_color text,
  
  -- Organization
  display_order integer DEFAULT 0,
  is_primary boolean DEFAULT false,
  
  -- Status
  upload_status text DEFAULT 'completed' CHECK (upload_status IN ('pending', 'processing', 'completed', 'failed')),
  
  -- Timestamps
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  deleted_at timestamp with time zone,
  
  -- Indexes
  CONSTRAINT valid_public_id CHECK (char_length(public_id) > 0),
  CONSTRAINT valid_secure_url CHECK (char_length(secure_url) > 0)
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_image_metadata_user_id ON public.image_metadata(user_id);
CREATE INDEX IF NOT EXISTS idx_image_metadata_entity ON public.image_metadata(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_image_metadata_entity_id ON public.image_metadata(entity_id);
CREATE INDEX IF NOT EXISTS idx_image_metadata_is_primary ON public.image_metadata(is_primary);
CREATE INDEX IF NOT EXISTS idx_image_metadata_created_at ON public.image_metadata(created_at DESC);

-- Row Level Security (RLS) Policies
ALTER TABLE public.image_metadata ENABLE ROW LEVEL SECURITY;

-- Users can view their own images
CREATE POLICY "Users can view own images"
  ON public.image_metadata
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own images
CREATE POLICY "Users can insert own images"
  ON public.image_metadata
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own images
CREATE POLICY "Users can update own images"
  ON public.image_metadata
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own images
CREATE POLICY "Users can delete own images"
  ON public.image_metadata
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to handle image_metadata timestamp updates
CREATE OR REPLACE FUNCTION update_image_metadata_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS trigger_image_metadata_updated_at ON public.image_metadata;
CREATE TRIGGER trigger_image_metadata_updated_at
  BEFORE UPDATE ON public.image_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_image_metadata_updated_at();

-- Add comment to table
COMMENT ON TABLE public.image_metadata IS 'Stores metadata for all uploaded images across the platform (housing, marketplace, profiles, community)';
