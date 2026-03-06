import { useState } from 'react';

interface RoleSelectionProps {
  onRoleSelected: (role: 'renter' | 'landlord' | 'seller' | 'admin') => void;
  loading?: boolean;
}

export function RoleSelection({ onRoleSelected, loading = false }: RoleSelectionProps) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const roles = [
    {
      id: 'renter',
      title: 'Renter / Young Professional',
      description: 'Looking for housing, marketplace items, and budget meals',
      icon: '🏠',
      features: [
        'Browse housing listings',
        'Shop marketplace items',
        'Find budget meals',
        'Connect with landlords',
      ],
    },
    {
      id: 'landlord',
      title: 'Landlord / Property Manager',
      description: 'Own or manage properties and rent to students',
      icon: '🏠',
      features: [
        'List properties',
        'Manage tenant applications',
        'Verify tenants',
        'Track ratings & reviews',
      ],
    },
    {
      id: 'seller',
      title: 'Seller / Vendor',
      description: 'Sell items, offer services, or cook budget meals',
      icon: '🛍️',
      features: [
        'Create store',
        'List items for sale',
        'Offer meals or services',
        'Manage orders',
      ],
    },
  ];

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Welcome to Homelink</h1>
        <p className="text-gray-600">Choose how you'll use our platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {roles.map(role => (
          <button
            key={role.id}
            onClick={() => setSelectedRole(role.id)}
            className={`p-6 rounded-lg border-2 text-left transition ${
              selectedRole === role.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-4xl mb-3">{role.icon}</div>
            <h2 className="text-xl font-semibold mb-1">{role.title}</h2>
            <p className="text-sm text-gray-600 mb-4">{role.description}</p>
            
            <ul className="space-y-1">
              {role.features.map((feature, idx) => (
                <li key={idx} className="text-sm text-gray-700 flex items-start">
                  <span className="mr-2">•</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {selectedRole === role.id && (
              <div className="mt-4 flex items-center text-blue-600 font-medium text-sm">
                <span className="mr-1">✓</span>
                Selected
              </div>
            )}
          </button>
        ))}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-blue-900 mb-2">Can I change my role later?</h3>
        <p className="text-sm text-blue-800">
          Yes! You can add additional roles to your account anytime. Choose what fits you best for now.
        </p>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => setSelectedRole(null)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
        >
          Clear
        </button>
        <button
          onClick={() => selectedRole && onRoleSelected(selectedRole as any)}
          disabled={!selectedRole || loading}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 font-medium"
        >
          {loading ? 'Continuing...' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
