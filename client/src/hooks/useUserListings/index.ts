import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import type { Database } from '@/lib/supabase';

type ListingRow = Database['public']['Tables']['listings']['Row'];

export function useUserListings() {
  const user = useAuthStore((state) => state.user);
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    if (!user) {
      setListings([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('listings')
        .select('*')
        .eq('landlord_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setListings(data || []);
    } catch (err) {
      console.error('Error fetching user listings:', err);
      setError(err instanceof Error ? err.message : 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return {
    listings,
    loading,
    error,
    refetch: fetchListings,
  };
}
