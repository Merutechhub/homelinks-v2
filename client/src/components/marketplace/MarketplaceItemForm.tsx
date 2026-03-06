import { useState } from 'react';
import { X, Upload, GripVertical } from 'lucide-react';
import { useImageUpload } from '@/hooks/useImageUpload';
import { useAuthStore } from '@/stores/auth';
import { signImageUpload } from '@/lib/image-upload-api';

interface MarketplaceItemFormData {
  title: string;
  description: string;
  category: string;
  price: number | '';
  condition: 'new' | 'like-new' | 'good' | 'fair' | 'poor';
  location: string;
  tags: string[];
  shippingAvailable: boolean;
  negotiable: boolean;
}

interface MarketplaceItemFormProps {
  initialData?: Partial<MarketplaceItemFormData>;
  onSubmit: (data: MarketplaceItemFormData, images: File[]) => Promise<void>;
  onCancel?: () => void;
  submitLabel?: string;
  loading?: boolean;
}

const CATEGORIES = [
  'Electronics',
  'Furniture',
  'Books',
  'Clothing',
  'Sports',
  'Home & Garden',
  'Toys & Games',
  'Tools',
  'Art & Collectibles',
  'Other',
];

const CONDITIONS = [
  { value: 'new', label: 'Brand New' },
  { value: 'like-new', label: 'Like New' },
  { value: 'good', label: 'Good' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

export function MarketplaceItemForm({
  initialData = {},
  onSubmit,
  onCancel,
  submitLabel = 'List Item',
  loading = false,
}: MarketplaceItemFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<MarketplaceItemFormData>({
    title: initialData.title || '',
    description: initialData.description || '',
    category: initialData.category || 'Other',
    price: initialData.price || '',
    condition: initialData.condition || 'good',
    location: initialData.location || '',
    tags: initialData.tags || [],
    shippingAvailable: initialData.shippingAvailable || false,
    negotiable: initialData.negotiable || true,
  });

  const user = useAuthStore((state) => state.user);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<Partial<Record<keyof MarketplaceItemFormData, string>>>({});
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { uploads } = useImageUpload({
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
    apiKey: import.meta.env.VITE_CLOUDINARY_API_KEY || '',
    maxImages: 12,
    maxSizeMB: 5,
    onProgress: setUploadProgress,
  });

  const updateField = <K extends keyof MarketplaceItemFormData>(
    field: K,
    value: MarketplaceItemFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 12) {
      setUploadError('Maximum 12 images allowed');
      return;
    }

    setImages((prev) => [...prev, ...files]);

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreviews((prev) => [...prev, event.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
    setUploadError(null);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const moveImage = (from: number, to: number) => {
    const newImages = [...images];
    const newPreviews = [...imagePreviews];
    [newImages[from], newImages[to]] = [newImages[to], newImages[from]];
    [newPreviews[from], newPreviews[to]] = [newPreviews[to], newPreviews[from]];
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const validateStep1 = (): boolean => {
    const newErrors: typeof errors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price) newErrors.price = 'Price is required';
    if (formData.price && (Number(formData.price) < 0 || Number(formData.price) > 1000000)) {
      newErrors.price = 'Price must be between 0 and 1,000,000';
    }
    if (!formData.location.trim()) newErrors.location = 'Location is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    if (images.length === 0) {
      setUploadError('At least one image is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
      }
      return;
    }

    if (step === 2) {
      if (!validateStep2()) return;

      try {
        // Sign each image for upload
        const imageIds = images.map((_, i) => `img-${Date.now()}-${i}`);
        
        for (let i = 0; i < images.length; i++) {
          await signImageUpload({
            type: 'marketplace-item',
            userId: user?.id || '',
            entityId: `temp-${Date.now()}`, // Will be replaced with actual ID after item creation
            filename: images[i].name,
          });
        }

        // Submit form with images
        await onSubmit(formData, images);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to process images';
        setUploadError(message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-bold mb-8">List an Item</h1>

        {/* Step Indicator */}
        <div className="mb-8">
          <div className="flex justify-between mb-4">
            <div className={`flex-1 pb-2 mr-4 ${step === 1 ? 'border-b-4 border-blue-500' : 'border-b-2 border-gray-300'}`}>
              <span className={`text-sm font-semibold ${step === 1 ? 'text-blue-600' : 'text-gray-600'}`}>
                Step 1: Item Details
              </span>
            </div>
            <div className={`flex-1 pb-2 ${step === 2 ? 'border-b-4 border-blue-500' : 'border-b-2 border-gray-300'}`}>
              <span className={`text-sm font-semibold ${step === 2 ? 'text-blue-600' : 'text-gray-600'}`}>
                Step 2: Photos
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {step === 1 && (
            <>
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateField('title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="What are you selling?"
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
                  placeholder="Describe the item, condition, and any defects"
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => updateField('category', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => updateField('price', e.target.value ? Number(e.target.value) : '')}
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>
                  {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condition
                  </label>
                  <select
                    value={formData.condition}
                    onChange={(e) => updateField('condition', e.target.value as any)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {CONDITIONS.map((cond) => (
                      <option key={cond.value} value={cond.value}>
                        {cond.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location *
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => updateField('location', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="City, State"
                />
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
              </div>

              {/* Checkboxes */}
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.shippingAvailable}
                    onChange={(e) => updateField('shippingAvailable', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="ml-3 text-sm text-gray-700">Shipping available</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.negotiable}
                    onChange={(e) => updateField('negotiable', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="ml-3 text-sm text-gray-700">Price negotiable</span>
                </label>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-4">
                  Item Photos (Up to 12 images)
                </label>

                {uploadError && (
                  <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {uploadError}
                  </div>
                )}

                {/* Image Preview Grid */}
                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-lg transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => moveImage(index, index - 1)}
                              className="p-2 bg-white rounded-full hover:bg-gray-200"
                            >
                              <GripVertical size={16} />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="p-2 bg-white rounded-full hover:bg-gray-200"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* File Input */}
                {images.length < 12 && (
                  <label className="block border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition">
                    <Upload className="mx-auto mb-2 text-gray-400" size={32} />
                    <div className="text-sm text-gray-600">
                      <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      PNG, JPG, WEBP up to 5MB
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                )}

                <p className="text-sm text-gray-500 mt-2">
                  {images.length}/12 images uploaded
                </p>
              </div>
            </>
          )}

          {/* Upload Progress */}
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-6">
            {step === 2 && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
              >
                Back
              </button>
            )}

            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={loading || uploadProgress > 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {loading ? 'Processing...' : step === 1 ? 'Next' : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
