// src/contexts/AuthContext.jsx - FIXED LOADING ISSUE
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
  const [profile, setProfile] = useState(null);

  console.log("🔥 AuthProvider rendering - loading:", loading, "user:", !!user);

  // ✅ FIXED: Enhanced admin detection with profile data
  const isAdmin = () => {
    if (!user) return false;

    // Check multiple sources for admin role
    const adminSources = [
      // Profile role (from database)
      profile?.role === "admin",
      // User metadata
      user.user_metadata?.role === "admin",
      // App metadata
      user.app_metadata?.role === "admin",
      // Email-based admin detection
      user.email?.endsWith("@goformed.co.uk"),
      // Specific admin emails
      ["admin@goformed.co.uk", "support@goformed.co.uk"].includes(
        user.email?.toLowerCase()
      ),
    ];

    const hasAdminRole = adminSources.some(Boolean);

    console.log("🔒 Admin check for", user.email, {
      profileRole: profile?.role,
      userMetadata: user.user_metadata?.role,
      appMetadata: user.app_metadata?.role,
      emailDomain: user.email?.endsWith("@goformed.co.uk"),
      finalResult: hasAdminRole,
    });

    return hasAdminRole;
  };

  // ✅ Fetch user profile from database (with timeout)
  const fetchUserProfile = async (userId) => {
    if (!userId) return null;

    try {
      console.log("👤 Fetching profile for user:", userId);

      // ✅ Add timeout to prevent hanging
      const profilePromise = supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Profile fetch timeout")), 5000)
      );

      const { data, error } = await Promise.race([
        profilePromise,
        timeoutPromise,
      ]);

      if (error) {
        console.warn("Profile fetch error (may not exist yet):", error.message);
        return null;
      }

      console.log("✅ Profile fetched successfully:", data);
      return data;
    } catch (error) {
      console.error("❌ Profile fetch failed:", error.message);
      return null;
    }
  };

  // ✅ FIXED: Initialize auth state with timeout and better error handling
  useEffect(() => {
    console.log("🚀 AuthContext useEffect starting...");

    if (!isSupabaseConfigured()) {
      console.log("❌ Supabase not configured, setting loading false");
      setLoading(false);
      return;
    }

    let mounted = true;
    let initTimeout;

    const initAuth = async () => {
      try {
        console.log("📡 Getting initial session...");

        // ✅ Add timeout for session check
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Session timeout")), 8000)
        );

        const {
          data: { session },
          error,
        } = await Promise.race([sessionPromise, timeoutPromise]);

        if (error) {
          console.error("❌ Session error:", error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        console.log("📥 Initial session:", !!session, session?.user?.email);

        if (mounted) {
          if (session?.user) {
            // Fetch profile in parallel, but don't wait for it to complete
            fetchUserProfile(session.user.id)
              .then((userProfile) => {
                if (mounted) {
                  setProfile(userProfile);
                  console.log("✅ Profile set:", userProfile);
                }
              })
              .catch((error) => {
                console.warn(
                  "⚠️ Profile fetch failed, continuing without profile:",
                  error.message
                );
              });

            setSession(session);
            setUser(session.user);
            setLoading(false);

            console.log(
              "✅ Auth state set - loading: false, user:",
              !!session.user
            );
          } else {
            setSession(null);
            setUser(null);
            setProfile(null);
            setLoading(false);
            console.log("✅ No session - loading: false");
          }
        }
      } catch (error) {
        console.error("💥 Init auth error:", error.message);
        if (mounted) {
          setLoading(false);
          console.log("✅ Loading set to false due to error");
        }
      }
    };

    // ✅ FIXED: Auth listener with better error handling
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log(
        "🔄 Auth state change:",
        event,
        !!session,
        session?.user?.email
      );

      if (mounted) {
        if (session?.user) {
          // Fetch profile in background, don't block UI
          fetchUserProfile(session.user.id)
            .then((userProfile) => {
              if (mounted) {
                setProfile(userProfile);
              }
            })
            .catch((error) => {
              console.warn(
                "⚠️ Profile fetch in auth change failed:",
                error.message
              );
            });

          setSession(session);
          setUser(session.user);
        } else {
          setSession(null);
          setUser(null);
          setProfile(null);
        }

        // ✅ CRITICAL: Always set loading to false
        if (loading) {
          setLoading(false);
          console.log("✅ Loading set to false from auth change");
        }
      }
    });

    // ✅ Start initialization
    initAuth();

    // ✅ CRITICAL: Fallback timeout to ensure loading never stays true forever
    initTimeout = setTimeout(() => {
      if (mounted && loading) {
        console.warn(
          "⚠️ Auth initialization timeout, forcing loading to false"
        );
        setLoading(false);
      }
    }, 10000); // 10 second max wait

    return () => {
      console.log("🧹 Cleaning up auth listener");
      mounted = false;
      if (initTimeout) clearTimeout(initTimeout);
      subscription.unsubscribe();
    };
  }, []); // Empty dependencies

  // ✅ Sign in with profile fetching (non-blocking)
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // If sign in successful, fetch profile in background
    if (data.user && !error) {
      fetchUserProfile(data.user.id)
        .then((userProfile) => {
          setProfile(userProfile);
        })
        .catch((error) => {
          console.warn("⚠️ Profile fetch after sign in failed:", error.message);
        });
    }

    return { data, error };
  };

  // ✅ Sign out with cleanup
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    return { error };
  };

  // ✅ Refresh profile (non-blocking)
  const refreshProfile = async () => {
    if (user?.id) {
      try {
        const userProfile = await fetchUserProfile(user.id);
        setProfile(userProfile);
        return userProfile;
      } catch (error) {
        console.warn("⚠️ Profile refresh failed:", error.message);
        return null;
      }
    }
    return null;
  };

  const value = {
    user,
    session,
    profile,
    loading,
    isInitialized: !loading,
    signIn,
    signOut,
    isAdmin,
    refreshProfile,
    isAuthenticated: !!user,
    isSupabaseConfigured: isSupabaseConfigured(),
  };

  console.log("📊 AuthContext value:", {
    user: !!user,
    profile: !!profile,
    isAdmin: isAdmin(),
    loading,
    isInitialized: !loading,
    isSupabaseConfigured: isSupabaseConfigured(),
  });

  // ✅ FORCE RENDER: Always render children, even if loading
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
