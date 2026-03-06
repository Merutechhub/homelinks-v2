/**
 * Server-side Cloudinary Signed Upload Endpoint
 * Generates secure upload signatures for client-side uploads
 * 
 * This follows v1 pattern but with improved folder management
 */

import crypto from 'crypto'

interface SignatureRequest {
  type: 'property' | 'marketplace-item' | 'profile' | 'community'
  userId: string
  entityId: string
  filename: string
}

interface SignatureResponse {
  timestamp: number
  signature: string
  publicId: string
  uploadUrl: string
  cloudName: string
  apiKey: string
}

export const generateCloudinarySignature = (
  request: SignatureRequest
): SignatureResponse => {
  const cloudName = process.env.VITE_CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.VITE_CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error('Missing Cloudinary configuration')
  }

  // Build public ID with folder structure
  const folder = `homelink/v2/${request.type}/${request.userId}/${request.entityId}`
  const sanitized = request.filename
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 100)
  
  const publicId = `${folder}/${sanitized}`

  // Generate timestamp and signature
  const timestamp = Math.floor(Date.now() / 1000)
  const params = {
    public_id: publicId,
    timestamp,
  }

  // Sort params and create signature
  const paramsString = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key as keyof typeof params]}`)
    .join('&')

  const signature = crypto
    .createHash('sha1')
    .update(paramsString + apiSecret)
    .digest('hex')

  return {
    timestamp,
    signature,
    publicId,
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    cloudName,
    apiKey,
  }
}

export const verifyCloudinarySignature = (
  public_id: string,
  timestamp: string,
  signature: string
): boolean => {
  const apiSecret = process.env.CLOUDINARY_API_SECRET
  if (!apiSecret) throw new Error('Missing Cloudinary API secret')

  const params = `public_id=${public_id}&timestamp=${timestamp}${apiSecret}`
  const hash = crypto.createHash('sha1').update(params).digest('hex')

  return hash === signature
}
