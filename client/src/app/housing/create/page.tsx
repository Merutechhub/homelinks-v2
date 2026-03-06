import { useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { PropertyForm } from '@/components/listing/PropertyForm';
import { useCreateProperty } from '@/hooks/useCreateProperty';
import { useAuthStore } from '@/store/authStore';

export default function CreateListingPage() {
  const [, setLocation] = useLocation();
  const user = useAuthStore((state) => state.user);
  const { createProperty, loading, uploadProgress } = useCreateProperty();

  const handleSubmit = async (data: any, images: File[]) => {
    try {
      const newId = await createProperty(data, images);
      // Redirect to new listing detail page
      setLocation(`/housing/${newId}`);
    } catch (error) {
      console.error('Failed to create property:', error);
      alert('Failed to create listing. Please try again.');
    }
  };

  const handleCancel = () => {
    setLocation('/housing');
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card p-8 text-center max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">You must be signed in to create a listing.</p>
          <button onClick={() => setLocation('/auth')} className="btn-primary">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => setLocation('/housing')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Housing</span>
        </button>

        <h1 className="text-3xl font-bold text-gray-900">Create New Listing</h1>
        <p className="text-gray-600 mt-2">
          Fill out the form below to list your property for rent.
        </p>
      </div>

      {/* Form */}
      <div className="card p-8">
        {uploadProgress > 0 && uploadProgress < 100 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
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

        <PropertyForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Create Listing"
          loading={loading}
        />
      </div>
    </div>
  );
}
