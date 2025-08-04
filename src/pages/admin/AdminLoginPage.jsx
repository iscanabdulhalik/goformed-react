// src/pages/admin/AdminLoginPage.jsx - FIXED ADMIN LOGIN WITH ROLE DETECTION
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  AlertCircle,
  Lock,
  Mail,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import goformedLogo from "@/assets/logos/goformed.png";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAdmin, refreshProfile } = useAuth();

  // ✅ FIXED: Check if user is already logged in as admin
  useEffect(() => {
    if (user && isAdmin()) {
      console.log(
        "✅ User already logged in as admin, redirecting to admin dashboard"
      );
      navigate("/admin", { replace: true });
    }
  }, [user, isAdmin, navigate]);

  // Show error from redirect if any
  useEffect(() => {
    if (location.state?.error) {
      setError(location.state.error);
    }
  }, [location.state]);

  // ✅ FIXED: Enhanced admin role checking
  const checkAdminRole = async (authUser) => {
    console.log("🔍 Checking admin role for:", authUser.email);

    // Step 1: Check metadata first (fast)
    const metadataChecks = [
      authUser.user_metadata?.role === "admin",
      authUser.app_metadata?.role === "admin",
      authUser.email?.endsWith("@goformed.co.uk"),
      ["admin@goformed.co.uk", "support@goformed.co.uk"].includes(
        authUser.email?.toLowerCase()
      ),
    ];

    const hasMetadataAdmin = metadataChecks.some(Boolean);
    console.log("📋 Metadata admin checks:", {
      userMetadata: authUser.user_metadata?.role,
      appMetadata: authUser.app_metadata?.role,
      emailDomain: authUser.email?.endsWith("@goformed.co.uk"),
      specificEmail: [
        "admin@goformed.co.uk",
        "support@goformed.co.uk",
      ].includes(authUser.email?.toLowerCase()),
      hasMetadataAdmin,
    });

    if (hasMetadataAdmin) {
      return true;
    }

    // Step 2: Check database profile (slower but authoritative)
    try {
      console.log("🗄️ Checking database profile...");
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authUser.id)
        .single();

      if (error) {
        console.warn("⚠️ Profile check failed:", error.message);
        return false;
      }

      const hasDbAdmin = profile?.role === "admin";
      console.log("📊 Database profile check:", {
        profileRole: profile?.role,
        hasDbAdmin,
      });

      return hasDbAdmin;
    } catch (error) {
      console.error("❌ Database profile check error:", error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      console.log("🔐 Starting admin login process for:", email);

      // Step 1: Sign in
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) {
        throw signInError;
      }

      if (!data.user) {
        throw new Error("Authentication failed");
      }

      console.log("✅ Authentication successful for:", data.user.email);

      // Step 2: Check admin role
      const hasAdminRole = await checkAdminRole(data.user);

      if (!hasAdminRole) {
        console.log("❌ User is not an admin, signing out:", data.user.email);
        // Sign out immediately
        await supabase.auth.signOut();
        throw new Error("Access denied. Admin privileges required.");
      }

      console.log("✅ Admin role confirmed for:", data.user.email);

      // Step 3: Refresh profile in context
      try {
        await refreshProfile();
        console.log("✅ Profile refreshed in context");
      } catch (profileError) {
        console.warn("⚠️ Profile refresh failed:", profileError);
        // Don't fail login if profile refresh fails
      }

      // Step 4: Log admin activity
      try {
        await supabase.rpc("log_activity", {
          p_user_id: data.user.id,
          p_action: "admin_login",
          p_description: "Admin user logged in",
          p_metadata: {
            ip: "unknown",
            user_agent: navigator.userAgent,
            login_method: "admin_portal",
          },
        });
        console.log("✅ Admin activity logged");
      } catch (logError) {
        console.warn("⚠️ Failed to log admin activity:", logError);
        // Don't fail login if logging fails
      }

      // Step 5: Redirect to admin dashboard
      console.log("🎯 Redirecting to admin dashboard");
      navigate("/admin", { replace: true });
    } catch (error) {
      console.error("❌ Admin login error:", error);

      // Enhanced error messages
      if (error.message === "Invalid login credentials") {
        setError(
          "Invalid email or password. Please verify your admin credentials."
        );
      } else if (error.message.includes("Access denied")) {
        setError(
          "Access denied. This account does not have admin privileges. Please contact support if you believe this is an error."
        );
      } else if (error.message.includes("Email not confirmed")) {
        setError(
          "Please confirm your email address before signing in. Check your inbox for a confirmation email."
        );
      } else if (error.message.includes("Too many requests")) {
        setError(
          "Too many login attempts. Please wait a few minutes before trying again."
        );
      } else {
        setError(
          error.message ||
            "An unexpected error occurred. Please try again or contact support."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardHeader className="text-center pb-8 pt-8">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <img
                  src={goformedLogo}
                  alt="GoFormed"
                  className="h-12 w-auto object-contain"
                />
                <Badge className="absolute -top-2 -right-2 bg-red-600 text-white text-xs px-2 py-1">
                  Admin
                </Badge>
              </div>
            </div>

            <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
              Admin Access Portal
            </CardTitle>
            <p className="text-gray-600 text-sm">
              Secure login for authorized administrators only
            </p>
          </CardHeader>

          <CardContent className="px-8 pb-8">
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="mb-6"
              >
                <div className="border border-red-200 bg-red-50 p-4 rounded-lg flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-700 text-sm font-medium">
                      Access Error
                    </p>
                    <p className="text-red-600 text-sm mt-1">{error}</p>
                  </div>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Admin Email Address
                  </Label>
                  <div className="relative mt-2">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@goformed.co.uk"
                      className="pl-10 h-12 border-gray-300 focus:border-red-500 focus:ring-red-500"
                      required
                      autoComplete="email"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Use your GoFormed admin email address
                  </p>
                </div>

                <div>
                  <Label
                    htmlFor="password"
                    className="text-gray-700 font-medium"
                  >
                    Admin Password
                  </Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your admin password"
                      className="pl-10 pr-10 h-12 border-gray-300 focus:border-red-500 focus:ring-red-500"
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !email || !password}
                className="w-full h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Verifying Admin Access...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Sign In to Admin Portal
                  </>
                )}
              </Button>
            </form>

            {/* Enhanced Security Notice */}
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-yellow-800 mb-2">
                    🔒 Enhanced Security Notice
                  </h4>
                  <div className="text-xs text-yellow-700 space-y-1">
                    <p>• All login attempts are monitored and logged</p>
                    <p>
                      • Admin access requires @goformed.co.uk email or database
                      role
                    </p>
                    <p>• Unauthorized access attempts will be blocked</p>
                    <p>• Contact IT support for access issues</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-6 text-center space-y-2">
              <button
                onClick={() => navigate("/")}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors block w-full"
              >
                ← Back to Main Site
              </button>
              <button
                onClick={() => navigate("/login")}
                className="text-sm text-blue-600 hover:text-blue-700 transition-colors"
              >
                Regular User Login →
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} GoFormed Ltd. Admin Portal v2.1
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Authorized personnel only • All activity monitored
          </p>
        </div>
      </motion.div>
    </div>
  );
}
