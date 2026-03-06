import { useParams, useLocation } from 'wouter';
import { ArrowLeft } from 'lucide-react';
import { PropertyForm } from '@/components/listing/PropertyForm';
import { useListingDetail } from '@/hooks/useListingDetail';
import { useUpdateProperty } from '@/hooks/useUpdateProperty';
import { useAuthStore } from '@/store/authStore';

export default function EditListingPage() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const id = params.id as string;
  const user = useAuthStore((state) => state.user);

  const { listing, loading: fetchLoading } = useListingDetail(id);
  const { updateProperty, loading: updateLoading } = useUpdateProperty();

  const handleSubmit = async (data: any, images: File[]) => {
    try {
      await updateProperty(id, data, images);
      // Redirect back to detail page
      setLocation(`/housing/${id}`);
    } catch (error) {
      console.error('Failed to update property:', error);
      alert('Failed to update listing. Please try again.');
    }
  };

  const handleCancel = () => {
    setLocation(`/housing/${id}`);
  };

  if (fetchLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="card p-8">
            <div className="h-64 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Listing not found</h2>
          <button onClick={() => setLocation('/housing')} className="btn-primary mt-4">
            Back to Housing
          </button>
        </div>
      </div>
    );
  }

  if (!user || listing.landlord_id !== user.id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">You do not have permission to edit this listing.</p>
          <button onClick={() => setLocation(`/housing/${id}`)} className="btn-primary">
            View Listing
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
          onClick={() => setLocation(`/housing/${id}`)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Listing</span>
        </button>

        <h1 className="text-3xl font-bold text-gray-900">Edit Listing</h1>
        <p className="text-gray-600 mt-2">Update your property information below.</p>
      </div>

      {/* Form */}
      <div className="card p-8">
        <PropertyForm
          initialData={{
            title: listing.title,
            description: listing.description || '',
            type: listing.type,
            price: listing.price,
            address: listing.address,
            bedrooms: listing.bedrooms,
            bathrooms: listing.bathrooms,
            amenities: listing.amenities || [],
            petFriendly: false, // TODO: Add to schema
            furnished: 'unfurnished', // TODO: Add to schema
            availableFrom: listing.available_from || '',
          }}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Update Listing"
          loading={updateLoading}
        />
      </div>
    </div>
  );
}
