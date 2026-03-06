import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { supabase } from "@/lib/supabase";
import type { User, AuthError } from "@supabase/supabase-js";

/* ──────────────────────────────────────────────────────────────
   useAuth — Manage authentication state with Supabase
   ────────────────────────────────────────────────────────────── */

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  const setAuthUser = useAuthStore((s) => s.setAuthUser);
  const clearAuth = useAuthStore((s) => s.clearAuth);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then((result: any) => {
      if (result.error) {
        setError(result.error);
      }
      if (result.data?.session?.user) {
        setUser(result.data.session.user);
        setAuthUser(result.data.session.user);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
      if (session?.user) {
        setUser(session.user);
        setAuthUser(session.user);
        setError(null);
      } else {
        setUser(null);
        clearAuth();
      }
      setLoading(false);
    });

    return () => subscription?.unsubscribe();
  }, [setAuthUser, clearAuth]);

  return { user, loading, error, setError };
}

/* ──────────────────────────────────────────────────────────────
   useLogin — Email/password login
   ────────────────────────────────────────────────────────────── */

export async function loginWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message);
  }

  return data.session;
}

/* ──────────────────────────────────────────────────────────────
   useSignup — Email/password signup with role selection
   ────────────────────────────────────────────────────────────── */

export async function signupWithEmail(
  email: string,
  password: string,
  userData: {
    name: string;
    username: string;
    role: "renter" | "landlord" | "seller";
    phone?: string;
  }
) {
  // Create auth user
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: userData.name,
        username: userData.username,
        role: userData.role,
      },
    },
  });

  if (authError) {
    throw new Error(authError.message);
  }

  if (!authData.user) {
    throw new Error("Failed to create user account");
  }

  // Create profile entry
  const { error: profileError } = await supabase.from("profiles").insert([
    {
      id: authData.user.id,
      username: userData.username,
      email: email,
      bio: "",
      location: "",
      verified: false,
      phone: userData.phone || null,
    },
  ]);

  if (profileError) {
    throw new Error(`Failed to create profile: ${profileError.message}`);
  }

  // Create user role entry
  const { error: roleError } = await supabase.from("user_roles").insert([
    {
      user_id: authData.user.id,
      primary_role: userData.role,
      secondary_roles: [],
    },
  ]);

  if (roleError) {
    throw new Error(`Failed to assign role: ${roleError.message}`);
  }

  // Create role-specific profile based on selected role
  if (userData.role === "renter") {
    const { error: renterError } = await supabase.from("renter_profile").insert([
      {
        user_id: authData.user.id,
      },
    ]);
    if (renterError) {
      throw new Error(`Failed to create renter profile: ${renterError.message}`);
    }
  } else if (userData.role === "landlord") {
    const { error: landlordError } = await supabase.from("landlord_profile").insert([
      {
        user_id: authData.user.id,
      },
    ]);
    if (landlordError) {
      throw new Error(`Failed to create landlord profile: ${landlordError.message}`);
    }
  } else if (userData.role === "seller") {
    const { error: sellerError } = await supabase.from("seller_profile").insert([
      {
        user_id: authData.user.id,
      },
    ]);
    if (sellerError) {
      throw new Error(`Failed to create seller profile: ${sellerError.message}`);
    }
  }

  return authData.session;
}

/* ──────────────────────────────────────────────────────────────
   useLogout — Sign out user
   ────────────────────────────────────────────────────────────── */

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}

/* ──────────────────────────────────────────────────────────────
   useResetPassword — Send password reset email
   ────────────────────────────────────────────────────────────── */

export async function sendPasswordResetEmail(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });

  if (error) {
    throw new Error(error.message);
  }
}

/* ──────────────────────────────────────────────────────────────
   useVerifyEmail — Check if email needs verification
   ────────────────────────────────────────────────────────────── */

export async function resendVerificationEmail(email: string) {
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: email,
  });

  if (error) {
    throw new Error(error.message);
  }
}
