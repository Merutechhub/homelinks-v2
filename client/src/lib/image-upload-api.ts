/**
 * Server API route to generate Cloudinary upload signatures
 * This is called from the client to get a secure signature for image upload
 * 
 * Pattern: POST /api/images/sign
 * Request: { type, userId, entityId, filename }
 * Response: { timestamp, signature, publicId, uploadUrl, cloudName, apiKey }
 */

import { generateCloudinarySignature } from '@/server/image-signatures'

interface SignRequest {
  type: 'property' | 'marketplace-item' | 'profile' | 'community'
  userId: string
  entityId: string
  filename: string
}

interface SignResponse {
  timestamp: number
  signature: string
  publicId: string
  uploadUrl: string
  cloudName: string
  apiKey: string
}

/**
 * Call the server API to delete an image
 * This ensures the API secret is used server-side for Cloudinary deletion
 */
export async function deleteImage(imageId: string, userId: string): Promise<void> {
  try {
    const response = await fetch(`/api/images/${imageId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to delete image')
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to delete image'
    throw new Error(message)
  }
}
  try {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    const apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY

    if (!cloudName || !apiKey) {
      throw new Error('Missing Cloudinary configuration')
    }

    // Call the server endpoint to get the signature
    const response = await fetch('/api/images/sign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to sign image upload')
    }

    const data = await response.json()

    return {
      timestamp: data.timestamp,
      signature: data.signature,
      publicId: data.public_id,
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
      cloudName,
      apiKey,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to sign upload'
    throw new Error(message)
  }
}
