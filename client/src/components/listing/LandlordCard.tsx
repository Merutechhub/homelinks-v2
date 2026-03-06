import { Shield, MessageCircle, User } from 'lucide-react';

interface LandlordCardProps {
  landlordId: string;
  landlordName?: string;
  landlordAvatar?: string | null;
  verified?: boolean;
  onMessage?: () => void;
}

export function LandlordCard({
  landlordId,
  landlordName,
  landlordAvatar,
  verified = false,
  onMessage,
}: LandlordCardProps) {
  return (
    <div className="card p-6">
      <h3 className="text-lg font-semibold mb-4">Listed by</h3>

      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
          {landlordAvatar ? (
            <img
              src={landlordAvatar}
              alt={landlordName || 'Landlord'}
              className="w-full h-full object-cover"
            />
          ) : (
            <User className="w-8 h-8 text-gray-400" />
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900 truncate">
              {landlordName || 'Anonymous Landlord'}
            </h4>
            {verified && (
              <Shield className="w-4 h-4 text-green-600 flex-shrink-0" title="Verified landlord" />
            )}
          </div>
          <p className="text-sm text-gray-500">Property Owner</p>

          {/* Contact Button */}
          {onMessage && (
            <button
              onClick={onMessage}
              className="btn-primary mt-4 w-full flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Message Landlord</span>
            </button>
          )}
        </div>
      </div>

      {/* Stats (placeholder for future enhancement) */}
      <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-primary">-</p>
          <p className="text-xs text-gray-500">Listings</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-primary">-</p>
          <p className="text-xs text-gray-500">Reviews</p>
        </div>
      </div>
    </div>
  );
}
