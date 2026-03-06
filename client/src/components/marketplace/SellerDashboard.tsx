import { useState, useEffect } from 'react';
import { Edit2, Trash2, Eye, Heart, Plus } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';

interface MarketplaceItem {
  id: string;
  title: string;
  price: number;
  condition: string;
  images: string[];
  view_count: number;
  favorite_count: number;
  status: string;
  created_at: string;
}

export function SellerDashboard() {
  const user = useAuthStore((state) => state.user);
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'sold' | 'delisted'>('active');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState({
    totalListings: 0,
    totalViews: 0,
    totalFavorites: 0,
    activeListing: 0,
  });

  useEffect(() => {
    if (!user) return;
    loadSellerItems();
  }, [user, filter]);

  const loadSellerItems = async () => {
    if (!user) return;

    try {
      setLoading(true);
      let query = supabase
        .from('marketplace_items')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('status', filter === 'delisted' ? 'delisted' : filter);
      }

      const { data, error } = await query;

      if (error) throw error;

      setItems(data || []);

      // Calculate stats
      if (data) {
        const totalViews = data.reduce((sum, item) => sum + (item.view_count || 0), 0);
        const totalFavorites = data.reduce((sum, item) => sum + (item.favorite_count || 0), 0);
        const activeListing = data.filter((item) => item.status === 'available').length;

        setStats({
          totalListings: data.length,
          totalViews,
          totalFavorites,
          activeListing,
        });
      }
    } catch (error) {
      console.error('Failed to load seller items:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;

    try {
      const { error } = await supabase
        .from('marketplace_items')
        .update({ status: 'delisted' })
        .eq('id', itemId);

      if (error) throw error;

      // Reload items
      await loadSellerItems();
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const handleToggleSelect = (itemId: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;
    if (!confirm(`Delete ${selectedItems.size} items?`)) return;

    try {
      const { error } = await supabase
        .from('marketplace_items')
        .update({ status: 'delisted' })
        .in('id', Array.from(selectedItems));

      if (error) throw error;

      setSelectedItems(new Set());
      await loadSellerItems();
    } catch (error) {
      console.error('Failed to bulk delete items:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your marketplace listings</p>
            </div>
            <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
              <Plus size={20} />
              New Listing
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-gray-600 text-sm font-medium mb-2">Total Listings</div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalListings}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-gray-600 text-sm font-medium mb-2">Active Listings</div>
            <div className="text-3xl font-bold text-green-600">{stats.activeListing}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-gray-600 text-sm font-medium mb-2">Total Views</div>
            <div className="text-3xl font-bold text-gray-900">{stats.totalViews}</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="text-gray-600 text-sm font-medium mb-2">Favorites</div>
            <div className="text-3xl font-bold text-red-600">{stats.totalFavorites}</div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-2">
              {(['all', 'active', 'sold', 'delisted'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    filter === f
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>

            {selectedItems.size > 0 && (
              <button
                onClick={handleBulkDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Delete {selectedItems.size} Items
              </button>
            )}
          </div>
        </div>

        {/* Items Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-r-transparent"></div>
            <p className="text-gray-600 mt-4">Loading your listings...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-200 text-center">
            <p className="text-gray-600 text-lg">No listings found</p>
            <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold">
              Create Your First Listing
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedItems.size === items.length && items.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedItems(new Set(items.map((i) => i.id)));
                        } else {
                          setSelectedItems(new Set());
                        }
                      }}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Item</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Price</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Views</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Favorites</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.id)}
                        onChange={() => handleToggleSelect(item.id)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.images.length > 0 && (
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-10 h-10 rounded object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{item.title}</p>
                          <p className="text-sm text-gray-500">{item.condition}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">${item.price.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          item.status === 'available'
                            ? 'bg-green-100 text-green-800'
                            : item.status === 'sold'
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-gray-700">
                        <Eye size={16} />
                        {item.view_count}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-red-600">
                        <Heart size={16} />
                        {item.favorite_count}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
