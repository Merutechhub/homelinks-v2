import React, { useState } from 'react';
import { usePermissionCheck } from '../../hooks/useRoles';
import { useAuth } from '../../hooks/useAuth';

export function AdminOnboarding() {
  const { user } = useAuth();
  const { getAdminPermissions } = usePermissionCheck(user?.id || '');
  const [adminLevel, setAdminLevel] = useState(1);
  const [permissions, setPermissions] = useState<Record<string, boolean>>({
    manageUsers: false,
    manageListings: false,
    managePosts: false,
    manageAds: false,
    viewAnalytics: false,
    viewAuditLog: false,
    manageModerators: false,
    managePlatformSettings: false,
  });
  const [loading, setLoading] = useState(false);

  const adminLevels = [
    { level: 1, title: 'Moderator', description: 'Moderate content and users' },
    { level: 2, title: 'Admin', description: 'Manage listings and ads' },
    { level: 3, title: 'Senior Admin', description: 'Manage all content and users' },
    { level: 4, title: 'Manager', description: 'Manage moderators and content policies' },
    { level: 5, title: 'Super Admin', description: 'Full system access' },
  ];

  const allPermissions = [
    { key: 'manageUsers', label: 'Manage Users', minLevel: 2 },
    { key: 'manageListings', label: 'Manage Listings', minLevel: 1 },
    { key: 'managePosts', label: 'Manage Posts', minLevel: 1 },
    { key: 'manageAds', label: 'Manage Ads', minLevel: 2 },
    { key: 'viewAnalytics', label: 'View Analytics', minLevel: 2 },
    { key: 'viewAuditLog', label: 'View Audit Log', minLevel: 3 },
    { key: 'manageModerators', label: 'Manage Moderators', minLevel: 4 },
    { key: 'managePlatformSettings', label: 'Manage Platform Settings', minLevel: 5 },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Call API to update admin profile with level and permissions
      const response = await fetch(`/api/admin/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminLevel,
          permissions,
        }),
      });
      if (response.ok) {
        // Redirect to admin dashboard
        window.location.href = '/admin';
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-2">Admin Setup ⚙️</h1>
      <p className="text-gray-600 mb-8">
        Configure your admin account and permissions
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Admin Level Selection */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Select Admin Level</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {adminLevels.map(({ level, title, description }) => (
              <button
                key={level}
                type="button"
                onClick={() => setAdminLevel(level)}
                className={`p-4 rounded-lg border-2 text-left transition ${
                  adminLevel === level
                    ? 'border-blue-600 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">{title}</h3>
                    <p className="text-xs text-gray-600">{description}</p>
                  </div>
                  {adminLevel === level && (
                    <div className="text-blue-600 text-lg">✓</div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Permissions Matrix */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Permissions</h2>
          <div className="space-y-2">
            {allPermissions.map(({ key, label, minLevel }) => {
              const isDisabled = adminLevel < minLevel;
              return (
                <label
                  key={key}
                  className={`flex items-center gap-3 p-3 rounded border ${
                    isDisabled
                      ? 'opacity-50 cursor-not-allowed bg-gray-50 border-gray-200'
                      : 'cursor-pointer hover:bg-gray-50 border-gray-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={permissions[key] || false}
                    onChange={(e) =>
                      setPermissions({
                        ...permissions,
                        [key]: e.target.checked,
                      })
                    }
                    disabled={isDisabled}
                    className="w-4 h-4"
                  />
                  <span className="flex-1">
                    <span className="font-medium text-sm">{label}</span>
                    {isDisabled && (
                      <span className="ml-2 text-xs text-gray-500">
                        (Level {minLevel}+ required)
                      </span>
                    )}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Current Admin Level Info */}
        <div className="bg-amber-50 border border-amber-200 rounded p-4">
          <h3 className="font-semibold text-amber-900 mb-2">Current Level</h3>
          <p className="text-sm text-amber-800">
            {adminLevels.find(a => a.level === adminLevel)?.description}
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 font-medium"
          >
            {loading ? 'Setting up...' : 'Complete Admin Setup'}
          </button>
        </div>
      </form>
    </div>
  );
}
