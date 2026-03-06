import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useImageMetadata } from '@/hooks/useImageMetadata';
import { signImageUpload } from '@/lib/image-upload-api';

interface CreatePropertyInput {
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

export function useCreateProperty() {
  const user = useAuthStore((state) => state.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { uploadImages: uploadToCloudinary } = useImageUpload({
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
    apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY || '',
    maxImages: 10,
  });
  const { saveMetadata } = useImageMetadata();

  const createProperty = async (data: CreatePropertyInput, images: File[]): Promise<string> => {
    if (!user) {
      throw new Error('Must be authenticated to create property');
    }

    try {
      setLoading(true);
      setError(null);
      setUploadProgress(0);

      // Create property record first (without images)
      const { data: property, error: insertError } = await supabase
        .from('listings')
        .insert({
          landlord_id: user.id,
          title: data.title,
          description: data.description,
          type: data.type,
          price: Number(data.price),
          address: data.address,
          bedrooms: data.bedrooms,
          bathrooms: data.bathrooms,
          amenities: data.amenities,
          images: [],
          available_from: data.availableFrom || null,
          status: 'available',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const propertyId = property.id;

      // Upload images to Cloudinary if provided
      if (images.length > 0) {
        const signatures = await Promise.all(
          images.map((file) =>
            signImageUpload({
              type: 'property',
              userId: user.id,
              entityId: propertyId,
              filename: file.name,
            })
          )
        );

        const uploadedResults = await uploadToCloudinary(
          images,
          { type: 'property', userId: user.id, entityId: propertyId, filename: '' },
          signatures
        );

        if (uploadedResults) {
          // Save image metadata
          await saveMetadata('property', 'property', user.id, uploadedResults);

          // Update property with image URLs
          const imageUrls = uploadedResults.map((r) => r.publicUrl);
          await supabase.from('listings').update({ images: imageUrls }).eq('id', propertyId);
        }
      }

      return propertyId;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create property';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return {
    createProperty,
    loading,
    error,
    uploadProgress,
  };
}
