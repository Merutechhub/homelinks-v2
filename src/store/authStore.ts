import { create } from "zustand";
import { User } from "@supabase/supabase-js";

/* ──────────────────────────────────────────────────────────────
   Auth Store — Manages authentication state and user profile
   ────────────────────────────────────────────────────────────── */

export type UserRole = "renter" | "landlord" | "seller" | "admin";

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar_url?: string | null;
  bio?: string | null;
  location?: string | null;
  verified: boolean;
  created_at: string;
}

export interface UserRoleData {
  primary_role: UserRole;
  secondary_roles: UserRole[];
}

interface AuthState {
  // Auth user (from Supabase)
  authUser: User | null;
  
  // Profile data (from database)
  profile: UserProfile | null;
  
  // Role data
  role: UserRoleData | null;
  
  // Loading states
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setAuthUser: (user: User | null) => void;
  setUser: (user: User | null) => void;  // Alias for backwards compatibility
  setProfile: (profile: UserProfile | null) => void;
  setRole: (role: UserRoleData | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  authUser: null,
  profile: null,
  role: null,
  isAuthenticated: false,
  isLoading: true,

  setAuthUser: (user) =>
    set({
      authUser: user,
      isAuthenticated: !!user,
    }),

  setUser: (user) =>
    set({
      authUser: user,
      isAuthenticated: !!user,
    }),

  setProfile: (profile) =>
    set({ profile }),

  setRole: (role) =>
    set({ role }),

  setLoading: (isLoading) =>
    set({ isLoading }),

  clearAuth: () =>
    set({
      authUser: null,
      profile: null,
      role: null,
      isAuthenticated: false,
    }),
}));
