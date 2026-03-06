import React from 'react';
import { useUserRole } from '../../hooks/useRoles';
import { useAuth } from '../../hooks/useAuth';

interface NavLink {
  label: string;
  href: string;
  icon: string;
  visibleTo?: string[];
  hiddenFrom?: string[];
}

interface RoleBasedNavigationProps {
  onLogout: () => void;
}

export function RoleBasedNavigation({ onLogout }: RoleBasedNavigationProps) {
  const { user } = useAuth();
  const { roleInfo } = useUserRole(user?.id || '');

  const allNavLinks: NavLink[] = [
    { label: 'Dashboard', href: '/dashboard', icon: '📊' },
    { label: 'Home', href: '/', icon: '🏠', visibleTo: ['student', 'landlord', 'seller'] },
    
    // Student-specific
    { label: 'Housing', href: '/housing', icon: '🏘️', visibleTo: ['student'] },
    { label: 'Budget Meals', href: '/budget-bite', icon: '🍱', visibleTo: ['student', 'seller'] },
    { label: 'Marketplace', href: '/marketplace', icon: '🛒', visibleTo: ['student', 'seller'] },
    
    // Landlord-specific
    { label: 'My Properties', href: '/landlord/properties', icon: '🏠', visibleTo: ['landlord'] },
    { label: 'Applications', href: '/landlord/applications', icon: '📋', visibleTo: ['landlord'] },
    { label: 'Tenants', href: '/landlord/tenants', icon: '👥', visibleTo: ['landlord'] },
    
    // Seller-specific
    { label: 'My Store', href: '/seller/store', icon: '🛍️', visibleTo: ['seller'] },
    { label: 'Inventory', href: '/seller/inventory', icon: '📦', visibleTo: ['seller'] },
    { label: 'Orders', href: '/seller/orders', icon: '📦', visibleTo: ['seller'] },
    
    // Admin-specific
    { label: 'Moderation', href: '/admin/moderation', icon: '⚖️', visibleTo: ['admin'] },
    { label: 'Users', href: '/admin/users', icon: '👥', visibleTo: ['admin'] },
    { label: 'Analytics', href: '/admin/analytics', icon: '📈', visibleTo: ['admin'] },
    { label: 'Settings', href: '/admin/settings', icon: '⚙️', visibleTo: ['admin'] },
    
    // General
    { label: 'Messages', href: '/messages', icon: '💬' },
    { label: 'Profile', href: '/profile', icon: '👤' },
    { label: 'Settings', href: '/settings', icon: '⚙️', hiddenFrom: ['admin'] },
  ];

  const visibleLinks = allNavLinks.filter(link => {
    if (link.visibleTo && !link.visibleTo.includes(roleInfo?.role)) {
      return false;
    }
    if (link.hiddenFrom && link.hiddenFrom.includes(roleInfo?.role)) {
      return false;
    }
    return true;
  });

  const groupedLinks = {
    main: visibleLinks.filter(l => ['Dashboard', 'Home', 'Messages'].includes(l.label)),
    role: visibleLinks.filter(l => !['Dashboard', 'Home', 'Messages', 'Profile', 'Settings'].includes(l.label)),
    user: visibleLinks.filter(l => ['Profile', 'Settings'].includes(l.label)),
  };

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center gap-2">
              <span className="text-2xl">🏠</span>
              <span className="font-bold text-lg">Homelink</span>
            </a>
          </div>

          {/* Main Navigation */}
          <div className="flex items-center gap-1">
            {groupedLinks.main.map(link => (
              <a
                key={link.href}
                href={link.href}
                className="px-3 py-2 rounded hover:bg-gray-100 text-sm font-medium text-gray-700"
              >
                {link.icon} {link.label}
              </a>
            ))}
          </div>

          {/* Role-specific dropdown */}
          <div className="flex items-center gap-4">
            <div className="relative group">
              <button className="px-3 py-2 rounded hover:bg-gray-100 text-sm font-medium text-gray-700 flex items-center gap-1">
                <span>{roleInfo?.role === 'student' ? '🎓' : roleInfo?.role === 'landlord' ? '🏠' : roleInfo?.role === 'seller' ? '🛍️' : '⚙️'}</span>
                <span className="capitalize">{roleInfo?.role}</span>
              </button>
              <div className="absolute right-0 mt-0 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="py-2">
                  {groupedLinks.role.map(link => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {link.icon} {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* User menu */}
            <div className="relative group">
              <button className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-medium">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </button>
              <div className="absolute right-0 mt-0 w-48 bg-white rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="py-2">
                  {groupedLinks.user.map(link => (
                    <a
                      key={link.href}
                      href={link.href}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      {link.icon} {link.label}
                    </a>
                  ))}
                  <button
                    onClick={onLogout}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    🚪 Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

interface RoleBasedSidebarProps {
  onLogout: () => void;
}

export function RoleBasedSidebar({ onLogout }: RoleBasedSidebarProps) {
  const { user } = useAuth();
  const { roleInfo } = useUserRole(user?.id || '');

  const sidebarItems: NavLink[] = [
    { label: 'Dashboard', href: '/dashboard', icon: '📊' },
    { label: 'Housing', href: '/housing', icon: '🏘️', visibleTo: ['student'] },
    { label: 'My Properties', href: '/landlord/properties', icon: '🏠', visibleTo: ['landlord'] },
    { label: 'My Store', href: '/seller/store', icon: '🛍️', visibleTo: ['seller'] },
    { label: 'Moderation', href: '/admin/moderation', icon: '⚖️', visibleTo: ['admin'] },
    { label: 'Messages', href: '/messages', icon: '💬' },
    { label: 'Saved Items', href: '/saved', icon: '❤️' },
  ];

  const visibleItems = sidebarItems.filter(item => {
    if (item.visibleTo && !item.visibleTo.includes(roleInfo?.role)) {
      return false;
    }
    return true;
  });

  return (
    <aside className="w-64 bg-white border-r border-gray-200 p-4">
      <div className="space-y-2">
        {visibleItems.map(item => (
          <a
            key={item.href}
            href={item.href}
            className="block px-4 py-2 rounded hover:bg-gray-100 text-sm font-medium text-gray-700"
          >
            {item.icon} {item.label}
          </a>
        ))}
      </div>
    </aside>
  );
}
