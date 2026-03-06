import { useState } from 'react';
import { X, Upload, GripVertical } from 'lucide-react';

interface PropertyFormData {
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

interface PropertyFormProps {
  initialData?: Partial<PropertyFormData>;
  onSubmit: (data: PropertyFormData, images: File[]) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  loading?: boolean;
}

const AMENITIES_OPTIONS = [
  'WiFi',
  'Parking',
  'Laundry',
  'Dishwasher',
  'Air Conditioning',
  'Heating',
  'Balcony',
  'Garden',
  'Gym',
  'Pool',
  'Security',
  'Storage',
];

export function PropertyForm({
  initialData = {},
  onSubmit,
  onCancel,
  submitLabel = 'Create Listing',
  loading = false,
}: PropertyFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<PropertyFormData>({
    title: initialData.title || '',
    description: initialData.description || '',
    type: initialData.type || 'apartment',
    price: initialData.price || '',
    address: initialData.address || '',
    bedrooms: initialData.bedrooms || 1,
    bathrooms: initialData.bathrooms || 1,
    amenities: initialData.amenities || [],
    petFriendly: initialData.petFriendly || false,
    furnished: initialData.furnished || 'unfurnished',
    availableFrom: initialData.availableFrom || '',
  });

  const user = useAuthStore((state) => state.user);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof PropertyFormData, string>>>({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { uploads } = useImageUpload({
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
    apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY || '',
    maxImages: 10,
    maxSizeMB: 5,
    onProgress: setUploadProgress,
  });

  const updateField = <K extends keyof PropertyFormData>(
    field: K,
    value: PropertyFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const toggleAmenity = (amenity: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newImages = [...images, ...files].slice(0, 10); // Max 10 images
    setImages(newImages);

    // Create previews
    const newPreviews = [...imagePreviews];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        setImagePreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const validateStep = (stepNumber: number): boolean => {
    const newErrors: Partial<Record<keyof PropertyFormData, string>> = {};

    if (stepNumber === 1) {
      if (!formData.title.trim()) newErrors.title = 'Title is required';
      if (formData.title.length < 10) newErrors.title = 'Title must be at least 10 characters';
      if (!formData.description.trim()) newErrors.description = 'Description is required';
      if (formData.description.length < 50)
        newErrors.description = 'Description must be at least 50 characters';
      if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required';
      if (!formData.address.trim()) newErrors.address = 'Address is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 3));
    }
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(step)) return;

    try {
      setUploadError(null);

      // If images selected, get upload signatures from server
      if (images.length > 0 && uploads.length === 0 && user) {
        // Generate signatures for each image (in production, call server endpoint)
        const _signatures = await Promise.all(
          images.map((file) =>
            signImageUpload({
              type: 'property',
              userId: user.id || '',
              entityId: 'temp', // Will be replaced with real ID after entity creation
              filename: file.name,
            })
          )
        );
        // Upload will happen in useCreateProperty hook
      }

      await onSubmit(formData, images);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Upload failed');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((num) => (
          <div key={num} className="flex items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                num === step
                  ? 'bg-primary text-white'
                  : num < step
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {num}
            </div>
            {num < 3 && (
              <div
                className={`w-16 h-1 ${num < step ? 'bg-green-500' : 'bg-gray-200'}`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Basic Info */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Basic Information</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="e.g., Modern 2BR Apartment in Downtown"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.title ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Describe your property in detail..."
              rows={5}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <p className="text-sm text-gray-500 mt-1">
              {formData.description.length} characters (minimum 50)
            </p>
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => updateField('type', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="room">Room</option>
                <option value="studio">Studio</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Rent *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => updateField('price', e.target.value ? Number(e.target.value) : '')}
                placeholder="0"
                min="0"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                  errors.price ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address/Location *
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => updateField('address', e.target.value)}
              placeholder="e.g., 123 Main St, San Francisco, CA"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
              <select
                value={formData.bedrooms}
                onChange={(e) => updateField('bedrooms', Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {[0, 1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num === 0 ? 'Studio' : `${num} Bedroom${num > 1 ? 's' : ''}`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
              <select
                value={formData.bathrooms}
                onChange={(e) => updateField('bathrooms', Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {[1, 1.5, 2, 2.5, 3, 3.5, 4].map((num) => (
                  <option key={num} value={num}>
                    {num} Bath{num > 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Property Details</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Furnished Status
            </label>
            <select
              value={formData.furnished}
              onChange={(e) => updateField('furnished', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="unfurnished">Unfurnished</option>
              <option value="partially">Partially Furnished</option>
              <option value="fully">Fully Furnished</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Available From
            </label>
            <input
              type="date"
              value={formData.availableFrom}
              onChange={(e) => updateField('availableFrom', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="petFriendly"
              checked={formData.petFriendly}
              onChange={(e) => updateField('petFriendly', e.target.checked)}
              className="w-5 h-5 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="petFriendly" className="text-sm font-medium text-gray-700">
              Pet-Friendly
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Amenities (select all that apply)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {AMENITIES_OPTIONS.map((amenity) => (
                <div key={amenity} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={amenity}
                    checked={formData.amenities.includes(amenity)}
                    onChange={() => toggleAmenity(amenity)}
                    className="w-4 h-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor={amenity} className="text-sm text-gray-700">
                    {amenity}
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Images */}
      {step === 3 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold mb-4">Property Images</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Images (max 10)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
           uploadError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {uploadError}
            </div>
          )}

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Uploading images...</span>
                <span className="text-sm text-gray-600">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {   <p className="text-gray-600 mb-2">Drag and drop images here, or click to browse</p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
                id="image-upload"
                disabled={images.length >= 10}
              />
              <label
                htmlFor="image-upload"
                className="btn-primary inline-block cursor-pointer disabled:opacity-50"
              >
                Choose Files
              </label>
              <p className="text-sm text-gray-500 mt-2">
                {images.length}/10 images uploaded
              </p>
            </div>
          </div>

          {imagePreviews.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between pt-6 border-t">
        <div>
          {step > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Back
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="btn-primary"
              disabled={loading}
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className="btn-primary disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Submitting...' : submitLabel}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
