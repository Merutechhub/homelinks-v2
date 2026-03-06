interface RoleBasedHomeProps {
  role: 'renter' | 'landlord' | 'seller' | 'admin';
}

export function RoleBasedHome({ role }: RoleBasedHomeProps) {
  if (!role) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <p className="text-slate-500">Loading...</p>
      </div>
    );
  }

  // Route to role-specific home page
  switch (role) {
    case 'renter':
      return <RenterHomePage />;
    case 'landlord':
      return <LandlordHomePage />;
    case 'seller':
      return <SellerHomePage />;
    case 'admin':
      return <AdminHomePage />;
    default:
      return <RenterHomePage />;
  }
}

function RenterHomePage() {
  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Welcome, Renter! 👋</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Start</h2>
          <div className="space-y-3">
            <a href="/housing" className="block p-3 bg-blue-50 rounded hover:bg-blue-100 text-blue-700 font-medium">
              🏘️ Browse Housing
            </a>
            <a href="/budget-bite" className="block p-3 bg-green-50 rounded hover:bg-green-100 text-green-700 font-medium">
              🍱 Find Budget Meals
            </a>
            <a href="/marketplace" className="block p-3 bg-purple-50 rounded hover:bg-purple-100 text-purple-700 font-medium">
              🛒 Browse Marketplace
            </a>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Your Dashboard</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Saved Housing</span>
              <span className="font-semibold text-lg">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Applications</span>
              <span className="font-semibold text-lg">3</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Messages</span>
              <span className="font-semibold text-lg bg-red-100 text-red-700 rounded-full w-6 h-6 flex items-center justify-center text-xs">5</span>
            </div>
          </div>
        </div>

        {/* Budget Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Budget Tracker</h2>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Monthly Budget</span>
                <span>$500</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>
            <p className="text-xs text-gray-500">$325 spent this month</p>
          </div>
        </div>
      </div>

      {/* Featured Housing */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Featured Housing Near You</h2>
        <div className="text-gray-500 text-center py-8">
          Loading featured listings...
        </div>
      </div>
    </div>
  );
}

function LandlordHomePage() {
  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Welcome, Landlord! 🏠</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-blue-600">5</div>
          <p className="text-gray-600 text-sm">Active Properties</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-green-600">12</div>
          <p className="text-gray-600 text-sm">Pending Applications</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-purple-600">48</div>
          <p className="text-gray-600 text-sm">Current Tenants</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-yellow-600">4.8★</div>
          <p className="text-gray-600 text-sm">Average Rating</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <a href="/landlord/properties" className="block p-3 bg-blue-50 rounded hover:bg-blue-100 text-blue-700 font-medium">
              📋 Manage Properties
            </a>
            <a href="/landlord/applications" className="block p-3 bg-green-50 rounded hover:bg-green-100 text-green-700 font-medium">
              ✅ Review Applications
            </a>
            <a href="/landlord/tenants" className="block p-3 bg-purple-50 rounded hover:bg-purple-100 text-purple-700 font-medium">
              👥 View Tenants
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Recent Applications</h2>
          <div className="text-gray-500 text-center py-8">
            No new applications
          </div>
        </div>
      </div>
    </div>
  );
}

function SellerHomePage() {
  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Welcome to Your Store! 🛍️</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-green-600">$2,450</div>
          <p className="text-gray-600 text-sm">This Month Revenue</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-blue-600">156</div>
          <p className="text-gray-600 text-sm">Items Listed</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-purple-600">87</div>
          <p className="text-gray-600 text-sm">Orders This Month</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-yellow-600">4.9★</div>
          <p className="text-gray-600 text-sm">Customer Rating</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Store Actions</h2>
          <div className="space-y-3">
            <a href="/seller/inventory" className="block p-3 bg-blue-50 rounded hover:bg-blue-100 text-blue-700 font-medium">
              📦 Manage Inventory
            </a>
            <a href="/seller/orders" className="block p-3 bg-green-50 rounded hover:bg-green-100 text-green-700 font-medium">
              📋 View Orders
            </a>
            <a href="/seller/store" className="block p-3 bg-purple-50 rounded hover:bg-purple-100 text-purple-700 font-medium">
              ⚙️ Store Settings
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">Recent Orders</h2>
          <div className="text-gray-500 text-center py-8">
            No recent orders
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminHomePage() {
  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard ⚙️</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-blue-600">24.5K</div>
          <p className="text-gray-600 text-sm">Total Users</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-red-600">12</div>
          <p className="text-gray-600 text-sm">Pending Moderation</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-green-600">98.5%</div>
          <p className="text-gray-600 text-sm">Platform Uptime</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-2xl font-bold text-purple-600">$48K</div>
          <p className="text-gray-600 text-sm">Monthly Revenue</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Admin Tools</h2>
          <div className="space-y-3">
            <a href="/admin/moderation" className="block p-3 bg-red-50 rounded hover:bg-red-100 text-red-700 font-medium">
              ⚖️ Moderation Queue
            </a>
            <a href="/admin/users" className="block p-3 bg-blue-50 rounded hover:bg-blue-100 text-blue-700 font-medium">
              👥 Manage Users
            </a>
            <a href="/admin/analytics" className="block p-3 bg-green-50 rounded hover:bg-green-100 text-green-700 font-medium">
              📊 View Analytics
            </a>
            <a href="/admin/settings" className="block p-3 bg-purple-50 rounded hover:bg-purple-100 text-purple-700 font-medium">
              ⚙️ Platform Settings
            </a>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 md:col-span-2">
          <h2 className="text-lg font-semibold mb-4">System Status</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>API Health</span>
              <span className="text-green-600">✓ Operational</span>
            </div>
            <div className="flex justify-between">
              <span>Database</span>
              <span className="text-green-600">✓ Healthy</span>
            </div>
            <div className="flex justify-between">
              <span>Cache</span>
              <span className="text-green-600">✓ Synced</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
