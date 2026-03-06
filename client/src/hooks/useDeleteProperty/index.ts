import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export function useDeleteProperty() {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteProperty = async (id: string): Promise<void> => {
    if (!user) {
      throw new Error('Must be authenticated to delete property');
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
        throw new Error('You do not have permission to delete this property');
      }

      // TODO: Delete images from Cloudinary

      // Delete property
      const { error: deleteError } = await supabase.from('listings').delete().eq('id', id);

      if (deleteError) throw deleteError;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete property';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteProperty,
    loading,
    error,
  };
}
