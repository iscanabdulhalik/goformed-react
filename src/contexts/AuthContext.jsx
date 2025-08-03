// src/contexts/AuthContext.jsx - Enhanced with better session management
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { supabase, isSupabaseConfigured } from "@/supabase";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Session refresh handler
  const refreshSession = useCallback(async () => {
    if (!supabase) return null;

    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();
      if (error) {
        console.error("Session refresh error:", error);
        return null;
      }
      return session;
    } catch (error) {
      console.error("Session refresh failed:", error);
      return null;
    }
  }, []);

  // Initialize auth state
  useEffect(() => {
    if (!isSupabaseConfigured()) {
      console.error("Supabase not configured, skipping auth initialization");
      setLoading(false);
      setIsInitialized(true);
      return;
    }

    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth initialization error:", error);
        }

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          setIsInitialized(true);
        }
      } catch (error) {
        console.error("Auth initialization failed:", error);
        if (mounted) {
          setLoading(false);
          setIsInitialized(true);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, session?.user?.email);

      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);

        // Handle specific auth events
        switch (event) {
          case "SIGNED_IN":
            console.log("User signed in:", session?.user?.email);
            break;
          case "SIGNED_OUT":
            console.log("User signed out");
            break;
          case "TOKEN_REFRESHED":
            console.log("Token refreshed for:", session?.user?.email);
            break;
          case "USER_UPDATED":
            console.log("User updated:", session?.user?.email);
            break;
        }

        if (!loading) {
          setLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loading]);

  // Sign in function
  const signIn = useCallback(async (email, password) => {
    if (!supabase) {
      throw new Error("Supabase not configured");
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error("Sign in error:", error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign up function
  const signUp = useCallback(async (email, password, options = {}) => {
    if (!supabase) {
      throw new Error("Supabase not configured");
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          ...options,
        },
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error) {
      console.error("Sign up error:", error);
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  }, []);

  // Sign out function
  const signOut = useCallback(async () => {
    if (!supabase) {
      throw new Error("Supabase not configured");
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setSession(null);

      return { error: null };
    } catch (error) {
      console.error("Sign out error:", error);
      return { error };
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset password function
  const resetPassword = useCallback(async (email) => {
    if (!supabase) {
      throw new Error("Supabase not configured");
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error("Reset password error:", error);
      return { error };
    }
  }, []);

  // Update password function
  const updatePassword = useCallback(async (password) => {
    if (!supabase) {
      throw new Error("Supabase not configured");
    }

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error("Update password error:", error);
      return { error };
    }
  }, []);

  // Check if user is admin
  const isAdmin = useCallback(() => {
    if (!user) return false;

    // Check user metadata for admin role
    return (
      user.user_metadata?.role === "admin" ||
      user.app_metadata?.role === "admin" ||
      user.email?.endsWith("@goformed.co.uk")
    ); // Fallback for admin emails
  }, [user]);

  // Auth context value
  const value = {
    user,
    session,
    loading,
    isInitialized,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    refreshSession,
    isAdmin,
    isAuthenticated: !!user,
    isSupabaseConfigured: isSupabaseConfigured(),
  };

  // Don't render children until auth is initialized (except when Supabase is not configured)
  if (!isInitialized && isSupabaseConfigured()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
