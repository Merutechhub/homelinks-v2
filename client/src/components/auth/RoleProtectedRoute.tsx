import React from 'react';
import { useUserRole } from '../../hooks/useRoles';
import { useAuth } from '../../hooks/useAuth';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredRole: string | string[];
  fallback?: React.ReactNode;
  redirectTo?: string;
}

export function RoleProtectedRoute({
  children,
  requiredRole,
  fallback,
  redirectTo = '/unauthorized',
}: RoleProtectedRouteProps) {
  const { user } = useAuth();
  const { roleInfo, loading } = useUserRole(user?.id || '');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  const hasPermission = requiredRoles.includes(roleInfo?.role);

  if (!hasPermission) {
    if (redirectTo !== '') {
      window.location.href = redirectTo;
      return null;
    }

    return (
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Access Denied</h1>
            <p className="text-gray-600 mb-6">
              You don't have permission to access this page.
            </p>
            <button
              onClick={() => window.history.back()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      )
    );
  }

  return <>{children}</>;
}

interface PermissionGateProps {
  children: React.ReactNode;
  permission: string;
  fallback?: React.ReactNode;
}

export function PermissionGate({ children, permission, fallback }: PermissionGateProps) {
  const { user } = useAuth();
  const { roleInfo } = useUserRole(user?.id || '');

  const hasPermission = roleInfo?.hasPermission?.(permission) || false;

  if (!hasPermission) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}

interface RoleVisibilityProps {
  children: React.ReactNode;
  visibleTo: string | string[];
  hiddenContent?: React.ReactNode;
}

export function RoleVisibility({
  children,
  visibleTo,
  hiddenContent,
}: RoleVisibilityProps) {
  const { user } = useAuth();
  const { roleInfo } = useUserRole(user?.id || '');

  const visibleToRoles = Array.isArray(visibleTo) ? visibleTo : [visibleTo];
  const isVisible = visibleToRoles.includes(roleInfo?.role);

  if (!isVisible) {
    return hiddenContent ? <>{hiddenContent}</> : null;
  }

  return <>{children}</>;
}
