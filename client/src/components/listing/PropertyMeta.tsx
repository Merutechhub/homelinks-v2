import { Bed, Bath, Home, MapPin, Calendar, Tag } from 'lucide-react';

interface PropertyMetaProps {
  type: string;
  bedrooms: number;
  bathrooms: number;
  address: string;
  description: string;
  amenities?: string[] | null;
  availableFrom?: string | null;
}

export function PropertyMeta({
  type,
  bedrooms,
  bathrooms,
  address,
  description,
  amenities,
  availableFrom,
}: PropertyMetaProps) {
  return (
    <div className="space-y-6">
      {/* Property Type & Location */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <Tag className="w-5 h-5 text-gray-500" />
          <span className="badge">{type}</span>
        </div>
        <div className="flex items-start gap-2 text-gray-600">
          <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <p className="text-sm">{address}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Bed className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm text-gray-500">Bedrooms</p>
            <p className="font-semibold">{bedrooms}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <Bath className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm text-gray-500">Bathrooms</p>
            <p className="font-semibold">{bathrooms}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg col-span-2 md:col-span-1">
          <Home className="w-5 h-5 text-primary" />
          <div>
            <p className="text-sm text-gray-500">Type</p>
            <p className="font-semibold capitalize">{type}</p>
          </div>
        </div>
      </div>

      {/* Availability */}
      {availableFrom && (
        <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
          <Calendar className="w-5 h-5 text-green-600" />
          <div>
            <p className="text-sm text-gray-600">Available from</p>
            <p className="font-semibold text-green-700">
              {new Date(availableFrom).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
      )}

      {/* Description */}
      <div>
        <h3 className="text-lg font-semibold mb-3">About this property</h3>
        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{description}</p>
      </div>

      {/* Amenities */}
      {amenities && amenities.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Amenities</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {amenities.map((amenity, index) => (
              <div
                key={index}
                className="flex items-center gap-2 p-2 bg-gray-50 rounded-md text-sm"
              >
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span className="text-gray-700">{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
