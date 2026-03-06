import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Share2, MapPin, DollarSign, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth';

interface FeedPost {
  id: string;
  author_id: string;
  content: string;
  images: string[];
  like_count: number;
  comment_count: number;
  created_at: string;
}

interface Listing {
  id: string;
  title: string;
  price: number;
  address: string;
  images: string[];
  bedrooms: number;
  bathrooms: number;
}

interface MarketplaceItem {
  id: string;
  title: string;
  price: number;
  condition: string;
  images: string[];
  location: string;
}

export function DiscoveryPage() {
  const user = useAuthStore((state) => state.user);
  const [activeTab, setActiveTab] = useState<'feed' | 'listings' | 'marketplace'>('feed');
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [items, setItems] = useState<MarketplaceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadContent();
  }, [activeTab]);

  const loadContent = async () => {
    try {
      setLoading(true);

      if (activeTab === 'feed') {
        await loadFeedPosts();
      } else if (activeTab === 'listings') {
        await loadListings();
      } else {
        await loadMarketplaceItems();
      }
    } finally {
      setLoading(false);
    }
  };

  const loadFeedPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('feed_posts')
        .select('*')
        .eq('visibility', 'public')
        .eq('status', 'published')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setPosts((data || []) as FeedPost[]);
    } catch (error) {
      console.error('Failed to load feed posts:', error);
    }
  };

  const loadListings = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setListings((data || []) as Listing[]);
    } catch (error) {
      console.error('Failed to load listings:', error);
    }
  };

  const loadMarketplaceItems = async () => {
    try {
      const { data, error } = await supabase
        .from('marketplace_items')
        .select('*')
        .eq('status', 'available')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setItems((data || []) as MarketplaceItem[]);
    } catch (error) {
      console.error('Failed to load marketplace items:', error);
    }
  };

  const handleLikePost = async (postId: string) => {
    if (!user) return;

    try {
      const isLiked = likedPosts.has(postId);

      if (isLiked) {
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        setLikedPosts((prev) => {
          const next = new Set(prev);
          next.delete(postId);
          return next;
        });
      } else {
        await supabase
          .from('post_likes')
          .insert({ post_id: postId, user_id: user.id });

        setLikedPosts((prev) => new Set(prev).add(postId));
      }
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Discover</h1>

          {/* Tab Navigation */}
          <div className="flex gap-8">
            {(['feed', 'listings', 'marketplace'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 font-semibold border-b-2 transition ${
                  activeTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'feed' ? 'Feed' : tab === 'listings' ? 'Housing' : 'Marketplace'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-r-transparent"></div>
            <p className="text-gray-600 mt-4">Loading...</p>
          </div>
        ) : activeTab === 'feed' ? (
          <div className="space-y-6">
            {posts.length === 0 ? (
              <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
                <p className="text-gray-600">No posts yet. Check back soon!</p>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  {/* Post Header */}
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100" />
                      <div>
                        <p className="font-semibold text-gray-900">User</p>
                        <p className="text-sm text-gray-500">{new Date(post.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* Post Content */}
                  {post.content && (
                    <div className="p-4">
                      <p className="text-gray-900">{post.content}</p>
                    </div>
                  )}

                  {/* Post Images */}
                  {post.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 p-4 bg-gray-50">
                      {post.images.slice(0, 4).map((image, i) => (
                        <img
                          key={i}
                          src={image}
                          alt="Post"
                          className="w-full h-40 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}

                  {/* Post Footer */}
                  <div className="p-4 border-t border-gray-100">
                    <div className="flex justify-between text-gray-600 mb-4 text-sm">
                      <span>{post.like_count} Likes</span>
                      <span>{post.comment_count} Comments</span>
                    </div>

                    <div className="flex gap-4 pt-2 border-t border-gray-100">
                      <button
                        onClick={() => handleLikePost(post.id)}
                        className={`flex-1 py-2 flex items-center justify-center gap-2 rounded hover:bg-gray-50 font-medium transition ${
                          likedPosts.has(post.id)
                            ? 'text-red-600'
                            : 'text-gray-600 hover:text-red-600'
                        }`}
                      >
                        <Heart
                          size={20}
                          fill={likedPosts.has(post.id) ? 'currentColor' : 'none'}
                        />
                        Like
                      </button>
                      <button className="flex-1 py-2 flex items-center justify-center gap-2 rounded hover:bg-gray-50 text-gray-600 hover:text-blue-600 font-medium transition">
                        <MessageCircle size={20} />
                        Comment
                      </button>
                      <button className="flex-1 py-2 flex items-center justify-center gap-2 rounded hover:bg-gray-50 text-gray-600 hover:text-blue-600 font-medium transition">
                        <Share2 size={20} />
                        Share
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : activeTab === 'listings' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.length === 0 ? (
              <div className="col-span-full bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
                <p className="text-gray-600">No housing listings available</p>
              </div>
            ) : (
              listings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition cursor-pointer"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    {listing.images.length > 0 ? (
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">No image</div>
                    )}
                    <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full shadow-sm">
                      <p className="font-bold text-gray-900">${listing.price}/mo</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{listing.title}</h3>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <MapPin size={16} />
                      {listing.address}
                    </div>

                    <div className="flex gap-4 text-sm text-gray-600 mb-3">
                      <span>{listing.bedrooms} beds</span>
                      <span>{listing.bathrooms} baths</span>
                    </div>

                    <button className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium transition">
                      View Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.length === 0 ? (
              <div className="col-span-full bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
                <p className="text-gray-600">No marketplace items available</p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition cursor-pointer"
                >
                  {/* Image */}
                  <div className="relative h-48 bg-gray-200 overflow-hidden">
                    {item.images.length > 0 ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">No image</div>
                    )}
                    <div className="absolute top-3 right-3 bg-white px-3 py-1 rounded-full shadow-sm">
                      <p className="font-bold text-gray-900">${item.price}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                      <MapPin size={16} />
                      {item.location}
                    </div>

                    <div className="inline-block mb-3 px-2 py-1 bg-gray-100 rounded text-sm text-gray-700">
                      {item.condition}
                    </div>

                    <button className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium transition">
                      View Details
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
