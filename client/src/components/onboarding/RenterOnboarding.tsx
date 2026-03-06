import React from 'react';

interface RenterOnboardingProps {
  onComplete: () => void;
}

export function RenterOnboarding({ onComplete }: RenterOnboardingProps) {
  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Welcome Section */}
      <div className="text-center mb-8">
        <div className="text-5xl mb-4">🏠</div>
        <h1 className="text-4xl font-bold mb-3">Welcome to Homelink, Renter!</h1>
        <p className="text-lg text-gray-600">Find affordable housing in Meru</p>
      </div>

      {/* Quick Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 rounded-lg p-6 text-center">
          <div className="text-3xl mb-2">🔍</div>
          <h3 className="font-semibold mb-1">Browse Properties</h3>
          <p className="text-sm text-gray-600">Explore verified listings in Meru</p>
        </div>
        <div className="bg-green-50 rounded-lg p-6 text-center">
          <div className="text-3xl mb-2">💬</div>
          <h3 className="font-semibold mb-1">Message Landlords</h3>
          <p className="text-sm text-gray-600">Ask questions directly</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-6 text-center">
          <div className="text-3xl mb-2">📅</div>
          <h3 className="font-semibold mb-1">Schedule Viewings</h3>
          <p className="text-sm text-gray-600">Book property tours</p>
        </div>
      </div>

      {/* Budget Bite Section */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-amber-200 rounded-lg p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="text-4xl">🍱</div>
          <div>
            <h3 className="text-lg font-bold text-amber-900 mb-2">Budget Bite - Affordable Meals</h3>
            <p className="text-sm text-amber-800 mb-3">
              Discover affordable, home-cooked meals from local sellers in Meru. Support small businesses while eating well on a budget.
            </p>
            <ul className="text-sm text-amber-800 space-y-1">
              <li>✓ Daily meal plans from local cooks</li>
              <li>✓ Dietary preferences supported</li>
              <li>✓ Budget-friendly pricing</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <p className="text-sm text-blue-900">
          <strong>Getting Started:</strong> Browse available properties, message landlords, schedule viewings, and explore affordable meals. No setup required to explore.
        </p>
      </div>

      {/* CTA Button */}
      <button
        onClick={onComplete}
        className="w-full px-6 py-3 bg-[#6b54ff] text-white rounded-lg font-semibold hover:bg-[#5946e6] transition"
      >
        Start Exploring Meru Properties →
      </button>
    </div>
  );
}
