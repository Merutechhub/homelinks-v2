import { useState, useCallback } from 'react'
import { buildPublicId, buildTransformUrl, validateImageFile, estimateImageDimensions, type ImageUploadConfig } from '@/lib/cloudinary'

interface UseImageUploadOptions {
  cloudName: string
  apiKey: string
  maxImages?: number
  maxSizeMB?: number
  onProgress?: (progress: number) => void
  onComplete?: (results: ImageUploadResult[]) => void
}

export interface ImageUploadResult {
  publicId: string
  publicUrl: string
  transformedUrl: string
  width: number
  height: number
  size: number
  uploadedAt: string
}

export function useImageUpload(options: UseImageUploadOptions) {
  const {
    cloudName,
    apiKey,
    maxImages = 10,
    maxSizeMB = 5,
    onProgress,
    onComplete,
  } = options

  const [uploads, setUploads] = useState<ImageUploadResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /**
   * Upload a single image to Cloudinary using signed upload
   */
  const uploadImage = useCallback(
    async (
      file: File,
      config: ImageUploadConfig,
      signature: {
        timestamp: number
        signature: string
        publicId: string
        uploadUrl: string
      }
    ): Promise<ImageUploadResult> => {
      // Validate file
      const validation = validateImageFile(file, maxSizeMB)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      // Get file dimensions for thumbnail generation
      const dimensions = await estimateImageDimensions(file)

      // Build form data for Cloudinary
      const formData = new FormData()
      formData.append('file', file)
      formData.append('public_id', signature.publicId)
      formData.append('api_key', apiKey)
      formData.append('timestamp', signature.timestamp.toString())
      formData.append('signature', signature.signature)
      formData.append('folder', config.filename) // For organization

      // Upload to Cloudinary
      const uploadResponse = await fetch(signature.uploadUrl, {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json()
        throw new Error(errorData.error?.message || 'Upload failed')
      }

      const uploadedData = (await uploadResponse.json()) as {
        public_id: string
        secure_url: string
        width: number
        height: number
        bytes: number
        created_at: string
        format: string
      }

      // Generate transformed URL for thumbnail
      const transformedUrl = buildTransformUrl(uploadedData.public_id, cloudName, {
        width: 400,
        height: 300,
        crop: 'fill',
        quality: 'auto',
        format: 'auto',
      })

      return {
        publicId: uploadedData.public_id,
        publicUrl: uploadedData.secure_url,
        transformedUrl,
        width: uploadedData.width,
        height: uploadedData.height,
        size: uploadedData.bytes,
        uploadedAt: uploadedData.created_at,
      }
    },
    [apiKey, cloudName, maxSizeMB]
  )

  /**
   * Upload multiple images sequentially
   */
  const uploadImages = useCallback(
    async (
      files: File[],
      config: ImageUploadConfig,
      signatures: Array<{ timestamp: number; signature: string; publicId: string; uploadUrl: string }>
    ) => {
      if (files.length === 0) {
        setError('No files to upload')
        return
      }

      if (files.length > maxImages) {
        setError(`Maximum ${maxImages} images allowed`)
        return
      }

      if (files.length !== signatures.length) {
        setError('Signature count mismatch')
        return
      }

      try {
        setLoading(true)
        setError(null)

        const results: ImageUploadResult[] = []

        for (let i = 0; i < files.length; i++) {
          const result = await uploadImage(files[i], config, signatures[i])
          results.push(result)

          // Update progress
          const progress = Math.round(((i + 1) / files.length) * 100)
          onProgress?.(progress)
        }

        setUploads(results)
        onComplete?.(results)

        return results
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [uploadImage, maxImages, onProgress, onComplete]
  )

  /**
   * Remove uploaded image from list (not from Cloudinary)
   */
  const removeUpload = useCallback((publicId: string) => {
    setUploads((prev) => prev.filter((u) => u.publicId !== publicId))
  }, [])

  /**
   * Clear all uploads
   */
  const clearUploads = useCallback(() => {
    setUploads([])
  }, [])

  return {
    uploads,
    loading,
    error,
    uploadImages,
    removeUpload,
    clearUploads,
  }
}
