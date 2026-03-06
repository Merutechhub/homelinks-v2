import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

interface UpdatePropertyInput {
  title: string;
  description: string;
  type: string;
  price: number | '';
  address: string;
  bedrooms: number;
  bathrooms: number;
  amenities: string[];
  petFriendly: boolean;
  furnished: string;
  availableFrom: string;
}

export function useUpdateProperty() {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProperty = async (
    id: string,
    data: UpdatePropertyInput,
    newImages?: File[]
  ): Promise<void> => {
    if (!user) {
      throw new Error('Must be authenticated to update property');
    }

    try {
      setLoading(true);
      setError(null);

      // Check ownership
      const { data: existing, error: fetchError } = await supabase
        .from('listings')
        .select('landlord_id, images')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      if (existing.landlord_id !== user.id) {
        throw new Error('You do not have permission to edit this property');
      }

      // TODO: Handle new image uploads to Cloudinary if provided
      const imageUrls = existing.images || [];

      // Update property
      const { error: updateError } = await supabase
        .from('listings')
        .update({
          title: data.title,
          description: data.description,
          type: data.type,
          price: Number(data.price),
          address: data.address,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          amenities: data.amenities,
          images: imageUrls,
          available_from: data.availableFrom || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) throw updateError;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update property';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    updateProperty,
    loading,
    error,
  };
}
