import React from 'react';

interface LandlordOnboardingProps {
  onComplete: () => void;
}

export function LandlordOnboarding({ onComplete }: LandlordOnboardingProps) {
  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Welcome Section */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">🏢</div>
        <h1 className="text-4xl font-bold mb-3">Welcome, Landlord!</h1>
        <p className="text-lg text-gray-600">List and manage properties in Meru</p>
      </div>

      {/* Quick Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-6 text-center">
          <div className="text-3xl mb-2">📝</div>
          <h3 className="font-semibold mb-1">List Properties</h3>
          <p className="text-sm text-gray-600">Add your properties to Meru listings</p>
        </div>
        <div className="bg-green-50 rounded-lg p-6 text-center">
          <div className="text-3xl mb-2">✅</div>
          <h3 className="font-semibold mb-1">Review Applications</h3>
          <p className="text-sm text-gray-600">Screen potential renters</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-6 text-center">
          <div className="text-3xl mb-2">👥</div>
          <h3 className="font-semibold mb-1">Manage Tenants</h3>
          <p className="text-sm text-gray-600">Track and communicate with renters</p>
        </div>
      </div>

      {/* Info Boxes */}
      <div className="space-y-4 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Get Started:</strong> Create property listings and start receiving applications from verified renters in Meru.
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-900">
            <strong>Note:</strong> Payments are handled separately. Focus on finding the right tenants for your properties.
          </p>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={onComplete}
        className="w-full px-6 py-3 bg-[#6b54ff] text-white rounded-lg font-semibold hover:bg-[#5946e6] transition"
      >
        Start Listing Properties →
      </button>
    </div>
  );
}
