import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'

/**
 * Hook to manage image metadata in Supabase
 * Stores public_id, URLs, dimensions, upload date, etc.
 */
export interface ImageMetadata {
  id: string
  entity_id: string
  entity_type: 'property' | 'marketplace-item' | 'profile' | 'community'
  user_id: string
  public_id: string
  public_url: string
  width: number
  height: number
  size: number
  order: number
  created_at: string
}

export function useImageMetadata() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Save image metadata to Supabase
   */
  const saveMetadata = useCallback(
    async (
      entityId: string,
      entityType: 'property' | 'marketplace-item' | 'profile' | 'community',
      userId: string,
      uploadResults: Array<{
        publicId: string
        publicUrl: string
        width: number
        height: number
        size: number
      }>
    ) => {
      try {
        setLoading(true)
        setError(null)

        const metadata = uploadResults.map((result, index) => ({
          entity_id: entityId,
          entity_type: entityType,
          user_id: userId,
          public_id: result.publicId,
          public_url: result.publicUrl,
          width: result.width,
          height: result.height,
          size: result.size,
          order: index,
        }))

        const { error: insertError } = await supabase
          .from('image_metadata')
          .insert(metadata)

        if (insertError) throw insertError
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to save image metadata'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  /**
   * Get images for an entity
   */
  const getImages = useCallback(
    async (entityId: string, entityType: string) => {
      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from('image_metadata')
          .select('*')
          .eq('entity_id', entityId)
          .eq('entity_type', entityType)
          .order('order', { ascending: true })

        if (fetchError) throw fetchError

        return (data as ImageMetadata[]) || []
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch images'
        setError(message)
        return []
      } finally {
        setLoading(false)
      }
    },
    []
  )

  /**
   * Delete image metadata
   */
  const deleteMetadata = useCallback(
    async (imageId: string) => {
      try {
        setLoading(true)
        setError(null)

        const { error: deleteError } = await supabase
          .from('image_metadata')
          .delete()
          .eq('id', imageId)

        if (deleteError) throw deleteError
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete image'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  /**
   * Update image order (for reordering)
   */
  const updateImageOrder = useCallback(
    async (updates: Array<{ id: string; order: number }>) => {
      try {
        setLoading(true)
        setError(null)

        for (const update of updates) {
          const { error: updateError } = await supabase
            .from('image_metadata')
            .update({ order: update.order })
            .eq('id', update.id)

          if (updateError) throw updateError
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to update image order'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  return {
    loading,
    error,
    saveMetadata,
    getImages,
    deleteMetadata,
    updateImageOrder,
  }
}
