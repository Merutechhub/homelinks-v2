import { useEffect, useState } from 'react';

export type UserRole = 'admin' | 'student' | 'landlord' | 'seller';

interface UserRoleInfo {
  userId: string;
  primaryRole: UserRole;
  secondaryRoles: UserRole[];
  permissions: Record<string, any>;
}

interface StudentProfile {
  schoolName: string;
  graduationYear: number;
  preferredLocations: string[];
  budgetMax: number;
  mealBudget: number;
  dietaryRestrictions: string[];
}

interface LandlordProfile {
  companyName: string;
  propertiesCount: number;
  totalRating: number;
  backgroundCheckPassed: boolean;
  bankAccountVerified: boolean;
}

interface SellerProfile {
  businessName: string;
  storeCategory: string[];
  totalSales: number;
  totalRating: number;
  itemsListed: number;
}

// Main role hook
export function useUserRole(userId: string) {
  const [roleInfo, setRoleInfo] = useState<UserRoleInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/roles/${userId}`);
        if (!res.ok) throw new Error('Failed to fetch role');
        const data = await res.json();
        setRoleInfo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchRole();
  }, [userId]);

  const hasPermission = (permission: string) => {
    if (!roleInfo?.permissions) return false;
    return roleInfo.permissions[permission] === true || roleInfo.permissions.all_permissions === true;
  };

  const isRole = (role: UserRole) => roleInfo?.primaryRole === role;
  const hasAnyRole = (...roles: UserRole[]) => roles.includes(roleInfo?.primaryRole || '' as UserRole);

  return { roleInfo, loading, error, hasPermission, isRole, hasAnyRole };
}

// Student-specific hook
export function useStudentProfile(userId: string) {
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await fetch(`/api/student-profile/${userId}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetch();
  }, [userId]);

  const updateProfile = async (updates: Partial<StudentProfile>) => {
    try {
      const res = await fetch(`/api/student-profile/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update');
      const data = await res.json();
      setProfile(data);
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return { profile, loading, updateProfile };
}

// Landlord-specific hook
export function useLandlordProfile(userId: string) {
  const [profile, setProfile] = useState<LandlordProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await fetch(`/api/landlord-profile/${userId}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetch();
  }, [userId]);

  const updateProfile = async (updates: Partial<LandlordProfile>) => {
    try {
      const res = await fetch(`/api/landlord-profile/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update');
      const data = await res.json();
      setProfile(data);
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return { profile, loading, updateProfile };
}

// Seller-specific hook
export function useSellerProfile(userId: string) {
  const [profile, setProfile] = useState<SellerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await fetch(`/api/seller-profile/${userId}`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setProfile(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetch();
  }, [userId]);

  const updateProfile = async (updates: Partial<SellerProfile>) => {
    try {
      const res = await fetch(`/api/seller-profile/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update');
      const data = await res.json();
      setProfile(data);
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return { profile, loading, updateProfile };
}

// Hook to check if user can perform action
export function usePermissionCheck(userId: string) {
  const { roleInfo, loading } = useUserRole(userId);

  const canListHousing = () => roleInfo?.permissions.can_list_housing === true;
  const canListItems = () => roleInfo?.permissions.can_list_items === true;
  const canListMeals = () => roleInfo?.permissions.can_list_meals === true;
  const canManageUsers = () => roleInfo?.permissions.can_manage_users === true;
  const canModerateContent = () => roleInfo?.permissions.can_moderate_content === true;
  const canViewAnalytics = () => roleInfo?.permissions.can_view_analytics === true;

  const getMaxListings = () => roleInfo?.permissions.max_listings || 0;
  const getMaxImagesPerListing = () => roleInfo?.permissions.max_images_per_listing || 0;

  return {
    loading,
    canListHousing,
    canListItems,
    canListMeals,
    canManageUsers,
    canModerateContent,
    canViewAnalytics,
    getMaxListings,
    getMaxImagesPerListing,
  };
}
