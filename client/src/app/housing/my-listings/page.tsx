import { useLocation } from 'wouter';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useUserListings } from '@/hooks/useUserListings';
import { useDeleteProperty } from '@/hooks/useDeleteProperty';
import { useAuthStore } from '@/store/authStore';
import { formatPrice } from '@/lib/utils';

export default function MyListingsPage() {
  const [, setLocation] = useLocation();
  const user = useAuthStore((state) => state.user);
  const { listings, loading, refetch } = useUserListings();
  const { deleteProperty, loading: deleteLoading } = useDeleteProperty();

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteProperty(id);
      await refetch();
    } catch (error) {
      console.error('Failed to delete property:', error);
      alert('Failed to delete listing. Please try again.');
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="card p-8 text-center max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-6">You must be signed in to view your listings.</p>
          <button onClick={() => setLocation('/auth')} className="btn-primary">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
          <p className="text-gray-600 mt-1">Manage your property listings</p>
        </div>

        <button
          onClick={() => setLocation('/housing/create')}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create Listing</span>
        </button>
      </div>

      {loading ? (
        <div className="card p-8 text-center">
          <p className="text-gray-600">Loading your listings...</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="card p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">No listings yet</h2>
          <p className="text-gray-600 mb-6">
            You haven't created any property listings. Start by creating your first one!
          </p>
          <button
            onClick={() => setLocation('/housing/create')}
            className="btn-primary inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span>Create Your First Listing</span>
          </button>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Beds/Baths
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Listed
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {listings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-16 w-16">
                          {listing.images && listing.images.length > 0 ? (
                            <img
                              src={listing.images[0]}
                              alt={listing.title}
                              className="h-16 w-16 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="h-16 w-16 rounded-lg bg-gray-200" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{listing.title}</div>
                          <div className="text-sm text-gray-500">{listing.address}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">
                        {formatPrice(listing.price)}/mo
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {listing.bedrooms} bd / {listing.bathrooms} ba
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {listing.status || 'Available'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(listing.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setLocation(`/housing/${listing.id}`)}
                          className="text-primary hover:text-primary-dark p-2 rounded-lg hover:bg-gray-100"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setLocation(`/housing/${listing.id}/edit`)}
                          className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-gray-100"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(listing.id, listing.title)}
                          disabled={deleteLoading}
                          className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y">
            {listings.map((listing) => (
              <div key={listing.id} className="p-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0">
                    {listing.images && listing.images.length > 0 ? (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="h-20 w-20 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-20 w-20 rounded-lg bg-gray-200" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">{listing.title}</h3>
                    <p className="text-sm text-gray-500 truncate">{listing.address}</p>
                    <p className="text-lg font-bold text-primary mt-1">
                      {formatPrice(listing.price)}/mo
                    </p>
                    <div className="flex items-center gap-4 mt-2">
                      <button
                        onClick={() => setLocation(`/housing/${listing.id}`)}
                        className="text-sm text-primary hover:underline"
                      >
                        View
                      </button>
                      <button
                        onClick={() => setLocation(`/housing/${listing.id}/edit`)}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(listing.id, listing.title)}
                        disabled={deleteLoading}
                        className="text-sm text-red-600 hover:underline disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
