import React from 'react';

interface SellerOnboardingProps {
  onComplete: () => void;
}

export function SellerOnboarding({ onComplete }: SellerOnboardingProps) {
  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Welcome Section */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">🛍️</div>
        <h1 className="text-4xl font-bold mb-3">Welcome, Seller!</h1>
        <p className="text-lg text-gray-600">Start selling in the Meru marketplace</p>
      </div>

      {/* Quick Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-6 text-center">
          <div className="text-3xl mb-2">📦</div>
          <h3 className="font-semibold mb-1">List Items</h3>
          <p className="text-sm text-gray-600">Add your products to marketplace</p>
        </div>
        <div className="bg-green-50 rounded-lg p-6 text-center">
          <div className="text-3xl mb-2">📊</div>
          <h3 className="font-semibold mb-1">Manage Store</h3>
          <p className="text-sm text-gray-600">Track inventory and orders</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-6 text-center">
          <div className="text-3xl mb-2">⭐</div>
          <h3 className="font-semibold mb-1">Build Reputation</h3>
          <p className="text-sm text-gray-600">Earn ratings and reviews</p>
        </div>
      </div>

      {/* Info Boxes */}
      <div className="space-y-4 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Get Started:</strong> Create your store and start listing items. Reach customers in Meru looking for what you offer.
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-900">
            <strong>Note:</strong> Payments will be handled separately. Focus on building your inventory and customer base.
          </p>
        </div>
      </div>

      {/* CTA Button */}
      <button
        onClick={onComplete}
        className="w-full px-6 py-3 bg-[#6b54ff] text-white rounded-lg font-semibold hover:bg-[#5946e6] transition"
      >
        Start Selling →
      </button>
    </div>
  );
}
