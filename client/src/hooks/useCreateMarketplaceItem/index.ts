import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useImageMetadata } from '@/hooks/useImageMetadata';
import { signImageUpload } from '@/lib/image-upload-api';

interface CreateMarketplaceItemInput {
  title: string;
  description: string;
  category: string;
  price: number | '';
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  location: string;
  tags: string[];
  shippingAvailable: boolean;
  negotiable: boolean;
}

export function useCreateMarketplaceItem() {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { uploadImages: uploadToCloudinary } = useImageUpload({
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
    apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY || '',
    maxImages: 12,
  });
  const { saveMetadata } = useImageMetadata();

  const createMarketplaceItem = async (
    data: CreateMarketplaceItemInput,
    images: File[]
  ): Promise<string> => {
    if (!user) {
      throw new Error('Must be authenticated to create marketplace item');
    }

    try {
      setLoading(true);
      setError(null);
      setUploadProgress(0);

      // Create marketplace item record first (without images)
      const { data: item, error: insertError } = await supabase
        .from('marketplace_items')
        .insert({
          seller_id: user.id,
          title: data.title,
          description: data.description,
          category: data.category,
          price: Number(data.price),
          condition: data.condition,
          location: data.location,
          tags: data.tags,
          images: [],
          shipping_available: data.shippingAvailable,
          negotiable: data.negotiable,
          status: 'available',
          view_count: 0,
          favorite_count: 0,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const itemId = item.id;

      // Upload images to Cloudinary if provided
      if (images.length > 0) {
        const signatures = await Promise.all(
          images.map((file) =>
            signImageUpload({
              type: 'marketplace-item',
              userId: user.id,
              entityId: itemId,
              filename: file.name,
            })
          )
        );

        const uploadedResults = await uploadToCloudinary(
          images,
          { type: 'marketplace-item', userId: user.id, entityId: itemId, filename: '' },
          signatures
        );

        if (uploadedResults) {
          // Save image metadata
          await saveMetadata('marketplace-item', 'marketplace-item', user.id, uploadedResults);

          // Update item with image URLs
          const imageUrls = uploadedResults.map((r) => r.publicUrl);
          await supabase.from('marketplace_items').update({ images: imageUrls }).eq('id', itemId);
        }
      }

      return itemId;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create marketplace item';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    createMarketplaceItem,
    loading,
    error,
    uploadProgress,
  };
}
