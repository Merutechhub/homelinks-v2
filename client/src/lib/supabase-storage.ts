/**
 * Supabase Storage Integration (Optional Backup)
 * 
 * Used as fallback if Cloudinary is unavailable
 * Mirrors folder structure: homelink/v2/{type}/{userId}/{entityId}/
 */

import { supabase } from './supabase'

export const STORAGE_BUCKET = 'images'

export const buildStoragePath = (type: string, userId: string, entityId: string, filename: string): string => {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, '-')
  return `homelink/v2/${type}/${userId}/${entityId}/${safeName}`
}

export const uploadToSupabaseStorage = async (
  file: File,
  type: string,
  userId: string,
  entityId: string,
  onProgress?: (progress: number) => void
) => {
  const path = buildStoragePath(type, userId, entityId, file.name)

  const { data, error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  })

  if (error) throw error

  // Get public URL
  const { data: publicUrlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path)

  return {
    path: data.path,
    url: publicUrlData.publicUrl,
  }
}

export const deleteFromSupabaseStorage = async (path: string) => {
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path])
  if (error) throw error
}

export const listStorageFiles = async (type: string, userId: string, entityId: string) => {
  const prefix = `homelink/v2/${type}/${userId}/${entityId}/`

  const { data, error } = await supabase.storage.from(STORAGE_BUCKET).list(prefix)
  if (error) throw error

  return data || []
}
