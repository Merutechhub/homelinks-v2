/**
 * Cloudinary Image Management System
 * 
 * Architecture:
 * - Folder Structure: /homelink/v2/{type}/{userId}/{entityId}/
 * - Types: properties, marketplace-items, profiles, community
 * - Signed uploads for security (no direct upload)
 * - Transformations for optimization (resize, quality, format)
 * - Backup to Supabase Storage (optional fallback)
 */

import type { UploadApiResponse, UploadApiErrorResponse } from 'cloudinary'

export type ImageType = 'property' | 'marketplace-item' | 'profile' | 'community'

export interface ImageUploadConfig {
  type: ImageType
  userId: string
  entityId: string
  filename: string
}

export interface CloudinarySignature {
  timestamp: number
  signature: string
  publicId: string
  uploadUrl: string
  apiKey: string
  cloudName: string
}

export interface CloudinaryUploadResult {
  publicId: string
  publicUrl: string
  secureUrl: string
  width: number
  height: number
  format: string
  bytes: number
  created: string
}

export interface ImageTransformOptions {
  width?: number
  height?: number
  crop?: 'fill' | 'fit' | 'scale' | 'crop' | 'thumb'
  quality?: 'auto' | number
  format?: 'auto' | 'webp' | 'jpg' | 'png'
  radius?: number | 'max'
}

/**
 * Build folder path for image organization
 * Example: homelink/v2/properties/user-123/listing-456/
 */
export const buildFolderPath = (config: ImageUploadConfig): string => {
  const { type, userId, entityId } = config
  return `homelink/v2/${type}/${userId}/${entityId}`
}

/**
 * Build public ID for Cloudinary
 * Example: homelink/v2/properties/user-123/listing-456/living-room
 */
export const buildPublicId = (config: ImageUploadConfig, filename?: string): string => {
  const folder = buildFolderPath(config)
  const safeName = sanitizeFilename(filename || config.filename)
  return `${folder}/${safeName}`
}

/**
 * Sanitize filename for safe Cloudinary storage
 * - Remove special characters
 * - Convert to lowercase
 * - Add timestamp for uniqueness
 */
export const sanitizeFilename = (filename: string): string => {
  const ext = filename.split('.').pop() || 'jpg'
  const name = filename
    .replace(/\.[^/.]+$/, '') // Remove extension
    .replace(/[^a-zA-Z0-9._-]/g, '-') // Remove special chars
    .replace(/^-+|-+$/g, '') // Remove leading/trailing dashes
    .toLowerCase()
    .slice(0, 50) // Max length

  const timestamp = Date.now().toString(36) // Compact timestamp
  return `${name}-${timestamp}.${ext}`
}

/**
 * Build Cloudinary transformation URL
 * Example: https://res.cloudinary.com/cloud/image/upload/w_800,h_600,q_auto,f_auto/public-id
 */
export const buildTransformUrl = (
  publicId: string,
  cloudName: string,
  options: ImageTransformOptions = {}
): string => {
  const {
    width,
    height,
    crop = 'fit',
    quality = 'auto',
    format = 'auto',
  } = options

  const transforms: string[] = []

  if (width) transforms.push(`w_${width}`)
  if (height) transforms.push(`h_${height}`)
  if (crop) transforms.push(`c_${crop}`)
  if (quality) transforms.push(`q_${quality}`)
  if (format) transforms.push(`f_${format}`)

  const transformString = transforms.join(',')
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`

  return transformString
    ? `${baseUrl}/${transformString}/${publicId}`
    : `${baseUrl}/${publicId}`
}

/**
 * Extract public ID from Cloudinary URL
 */
export const extractPublicId = (url: string): string | null => {
  if (!url) return null

  try {
    const cleanUrl = url.split('#')[0].split('?')[0] // Remove hash and query params
    const parts = cleanUrl.split('/upload/').pop()

    if (!parts) return null

    // Remove transformation params (w_*, q_*, etc)
    const pathParts = parts.split('/').filter(Boolean)
    const transformEndIndex = pathParts.findIndex((p) => !p.includes('_'))

    if (transformEndIndex === -1) {
      return pathParts.join('/')
    }

    return pathParts.slice(transformEndIndex).join('/')
  } catch (_) {
    return null
  }
}

/**
 * Calculate optimal image dimensions based on device
 */
export const getResponsiveDimensions = (device: 'mobile' | 'tablet' | 'desktop') => {
  const dimensions: Record<string, { width: number; height: number }> = {
    mobile: { width: 400, height: 300 },
    tablet: { width: 800, height: 600 },
    desktop: { width: 1200, height: 800 },
  }
  return dimensions[device] || dimensions.desktop
}

/**
 * Build srcset for responsive images
 */
export const buildSrcSet = (
  publicId: string,
  cloudName: string,
  baseOptions?: ImageTransformOptions
): string => {
  const sizes = [400, 800, 1200]
  return sizes
    .map((size) => {
      const url = buildTransformUrl(publicId, cloudName, {
        ...baseOptions,
        width: size,
      })
      return `${url} ${size}w`
    })
    .join(', ')
}

/**
 * Validate image file before upload
 */
export const validateImageFile = (file: File, maxSizeMB: number = 5): { valid: boolean; error?: string } => {
  // Check file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Use JPG, PNG, WebP, or GIF.' }
  }

  // Check file size
  const maxBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxBytes) {
    return { valid: false, error: `File size must be under ${maxSizeMB}MB` }
  }

  return { valid: true }
}

/**
 * Estimate image dimensions before upload
 */
export const estimateImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()

      img.onload = () => {
        resolve({ width: img.width, height: img.height })
      }

      img.onerror = () => {
        reject(new Error('Failed to load image'))
      }

      img.src = e.target?.result as string
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsDataURL(file)
  })
}
