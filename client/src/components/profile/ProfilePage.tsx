import React from 'react';
import { useProfile } from '../../hooks/useProfile';
import { useUserReputation } from '../../hooks/useUserReputation';
import { useUserBadges } from '../../hooks/useUserBadges';

interface ProfilePageProps {
  userId: string;
  isOwnProfile?: boolean;
}

export function ProfilePage({ userId, isOwnProfile = false }: ProfilePageProps) {
  const { profile, loading: profileLoading } = useProfile(userId);
  const { average, count: ratingCount } = useUserReputation(userId);
  const { badges } = useUserBadges(userId);

  if (profileLoading) return <div className="text-center py-8">Loading profile...</div>;
  if (!profile) return <div className="text-center py-8">Profile not found</div>;

  const renderStars = (rating: number) => {
    return '★'.repeat(Math.floor(rating)) + '☆'.repeat(5 - Math.floor(rating));
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-start gap-4 mb-4">
          {profile.avatar_url && (
            <img
              src={profile.avatar_url}
              alt={profile.username}
              className="w-24 h-24 rounded-full object-cover"
            />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl font-bold">{profile.username}</h1>
              {profile.verified && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm font-medium">
                  ✓ {profile.verification_type}
                </span>
              )}
            </div>
            {profile.location && <p className="text-gray-600">{profile.location}</p>}
            {profile.bio && <p className="mt-2 text-gray-700">{profile.bio}</p>}
          </div>
          {isOwnProfile && (
            <a
              href="/profile/edit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Edit Profile
            </a>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4 border-t pt-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{average}</div>
            <div className="text-sm text-gray-600">{renderStars(average)}</div>
            <div className="text-xs text-gray-500">({ratingCount} ratings)</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">{badges.length}</div>
            <div className="text-sm text-gray-600">Badges</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold">Verified</div>
            <div className="text-sm text-gray-600">
              {profile.verified ? profile.verification_type : 'None'}
            </div>
          </div>
        </div>
      </div>

      {badges.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Badges</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {badges.map(badge => (
              <div key={badge.id} className="text-center p-3 bg-gray-50 rounded">
                <div className="text-3xl mb-2">{badge.badge_icon}</div>
                <div className="text-sm font-medium">{badge.badge_name}</div>
                <div className="text-xs text-gray-500">
                  {new Date(badge.unlocked_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
