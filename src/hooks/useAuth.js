// src/hooks/useAuth.js - Additional auth hooks
import { useAuth as useAuthContext } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

// ✅ Re-export main hook
export const useAuth = useAuthContext;

// ✅ Login hook with navigation
export const useLogin = () => {
  const navigate = useNavigate();

  const redirectAfterLogin = useCallback(
    (userRole) => {
      const path = userRole === "admin" ? "/admin" : "/dashboard";
      navigate(path, { replace: true });
    },
    [navigate]
  );

  return { redirectAfterLogin };
};

// ✅ Logout hook with navigation
export const useLogout = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const logout = useCallback(
    async (redirectTo = "/login") => {
      const { error } = await signOut();

      if (!error) {
        navigate(redirectTo, { replace: true });
      }

      return { error };
    },
    [signOut, navigate]
  );

  return { logout };
};

// ✅ Admin check hook
export const useAdminCheck = () => {
  const { isAdmin, loading, user } = useAuth();

  return {
    isAdmin,
    loading,
    canAccessAdmin: isAdmin && user,
  };
};

// ✅ Profile management hook
export const useProfile = () => {
  const { profile, checkUserRole, user } = useAuth();

  const refreshProfile = useCallback(async () => {
    if (user?.id) {
      return await checkUserRole(user.id);
    }
    return null;
  }, [checkUserRole, user]);

  return {
    profile,
    refreshProfile,
    displayName:
      profile?.full_name ||
      user?.user_metadata?.full_name ||
      user?.email?.split("@")[0] ||
      "User",
  };
};
