import React, { useState } from 'react';

interface HousingListingFormProps {
  onSuccess?: (listingId: string) => void;
}

export function HousingCreateForm({ onSuccess }: HousingListingFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    pricePerMonth: '',
    bedrooms: 1,
    bathrooms: 1,
    squareFeet: '',
    propertyType: 'apartment' as const,
    furnished: false,
    availableDate: '',
    leaseTerm: '12 months',
    petFriendly: false,
  });
  const [amenities, setAmenities] = useState<string[]>([]);
  const [newAmenity, setNewAmenity] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const commonAmenities = ['WiFi', 'AC', 'Parking', 'Washer/Dryer', 'Dishwasher', 'Gym', 'Pool', 'Balcony'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const addAmenity = (amenity: string) => {
    if (!amenities.includes(amenity)) {
      setAmenities([...amenities, amenity]);
    }
  };

  const removeAmenity = (amenity: string) => {
    setAmenities(amenities.filter(a => a !== amenity));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await fetch('/api/housing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, amenities }),
      });
      if (!res.ok) throw new Error('Failed to create listing');
      const data = await res.json();
      onSuccess?.(data.id);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold mb-6">List Your Property</h1>

      {/* Basic Info */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
        <div className="space-y-4">
          <input
            type="text"
            name="title"
            placeholder="Property Title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-lg"
          />
          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-3 py-2 border rounded-lg"
          />
          <select
            name="propertyType"
            value={formData.propertyType}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="apartment">Apartment</option>
            <option value="house">House</option>
            <option value="condo">Condo</option>
            <option value="room">Room</option>
          </select>
        </div>
      </div>

      {/* Location */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Location</h2>
        <div className="space-y-4">
          <input
            type="text"
            name="address"
            placeholder="Street Address"
            value={formData.address}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border rounded-lg"
          />
          <div className="grid grid-cols-3 gap-3">
            <input
              type="text"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
              required
              className="px-3 py-2 border rounded-lg"
            />
            <input
              type="text"
              name="state"
              placeholder="State"
              value={formData.state}
              onChange={handleChange}
              required
              className="px-3 py-2 border rounded-lg"
            />
            <input
              type="text"
              name="zipCode"
              placeholder="ZIP"
              value={formData.zipCode}
              onChange={handleChange}
              className="px-3 py-2 border rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Property Details</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Bedrooms</label>
            <input
              type="number"
              name="bedrooms"
              value={formData.bedrooms}
              onChange={handleChange}
              min="1"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Bathrooms</label>
            <input
              type="number"
              name="bathrooms"
              value={formData.bathrooms}
              onChange={handleChange}
              step="0.5"
              min="1"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sq Ft</label>
            <input
              type="number"
              name="squareFeet"
              value={formData.squareFeet}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price/Month</label>
            <input
              type="number"
              name="pricePerMonth"
              value={formData.pricePerMonth}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Amenities</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {commonAmenities.map(amenity => (
            <button
              key={amenity}
              type="button"
              onClick={() => addAmenity(amenity)}
              className={`px-3 py-1 rounded border ${
                amenities.includes(amenity)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {amenity}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={newAmenity}
            onChange={(e) => setNewAmenity(e.target.value)}
            placeholder="Add custom amenity"
            className="flex-1 px-3 py-2 border rounded-lg"
          />
          <button
            type="button"
            onClick={() => {
              if (newAmenity) {
                addAmenity(newAmenity);
                setNewAmenity('');
              }
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Add
          </button>
        </div>
      </div>

      {/* Dates & Policies */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-4">Policies</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Available Date</label>
            <input
              type="date"
              name="availableDate"
              value={formData.availableDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Lease Term</label>
            <select
              name="leaseTerm"
              value={formData.leaseTerm}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
            >
              <option value="6 months">6 months</option>
              <option value="12 months">12 months</option>
              <option value="24 months">24 months</option>
              <option value="flexible">Flexible</option>
            </select>
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="petFriendly"
              checked={formData.petFriendly}
              onChange={handleChange}
            />
            <span className="text-sm font-medium">Pet Friendly</span>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="furnished"
              checked={formData.furnished}
              onChange={handleChange}
            />
            <span className="text-sm font-medium">Furnished</span>
          </label>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-semibold"
      >
        {submitting ? 'Creating Listing...' : 'Create Listing'}
      </button>
    </form>
  );
}
