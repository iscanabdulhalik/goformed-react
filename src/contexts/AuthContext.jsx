// src/contexts/AuthContext.jsx - MINIMAL TEST VERSION
import React, { createContext, useContext, useEffect, useState } from "react";
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

  console.log("🔥 AuthProvider rendering - loading:", loading, "user:", !!user);

  // ✅ MINIMAL: Simple isAdmin function
  const isAdmin = () => {
    if (!user) return false;
    return (
      user.user_metadata?.role === "admin" ||
      user.app_metadata?.role === "admin" ||
      user.email?.endsWith("@goformed.co.uk")
    );
  };

  // ✅ MINIMAL: Initialize auth state ONCE
  useEffect(() => {
    console.log("🚀 AuthContext useEffect starting...");

    if (!isSupabaseConfigured()) {
      console.log("❌ Supabase not configured, setting loading false");
      setLoading(false);
      return;
    }

    let mounted = true;

    const initAuth = async () => {
      try {
        console.log("📡 Getting initial session...");
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("❌ Session error:", error);
        }

        console.log("📥 Initial session:", !!session, session?.user?.email);

        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
          console.log(
            "✅ Auth state set - loading: false, user:",
            !!session?.user
          );
        }
      } catch (error) {
        console.error("💥 Init auth error:", error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // ✅ MINIMAL: Auth listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(
        "🔄 Auth state change:",
        event,
        !!session,
        session?.user?.email
      );

      if (mounted) {
        setSession(session);
        setUser(session?.user ?? null);
        if (loading) {
          setLoading(false);
          console.log("✅ Loading set to false from auth change");
        }
      }
    });

    initAuth();

    return () => {
      console.log("🧹 Cleaning up auth listener");
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // ✅ EMPTY DEPENDENCIES

  // ✅ MINIMAL: Simple auth functions
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    return { error };
  };

  const value = {
    user,
    session,
    loading,
    isInitialized: !loading, // Simple: if not loading, then initialized
    signIn,
    signOut,
    isAdmin,
    isAuthenticated: !!user,
    isSupabaseConfigured: isSupabaseConfigured(),
  };

  console.log("📊 AuthContext value:", {
    user: !!user,
    loading,
    isInitialized: !loading,
    isSupabaseConfigured: isSupabaseConfigured(),
  });

  // ✅ FORCE RENDER: Don't show loading screen, always render children
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
