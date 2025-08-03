// src/pages/admin/AdminLoginPage.jsx - Fixed admin login and redirect
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
// ✅ REMOVED: Alert import - using custom error display instead
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
  const { user, isAdmin } = useAuth();

  // ✅ FIXED: Check if user is already logged in as admin
  useEffect(() => {
    if (user && isAdmin()) {
      navigate("/admin", { replace: true });
    }
  }, [user, isAdmin, navigate]);

  // Show error from redirect if any
  useEffect(() => {
    if (location.state?.error) {
      setError(location.state.error);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // ✅ FIXED: Regular sign in, then check admin status
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

      // ✅ FIXED: Check if user is admin after successful login
      const isUserAdmin =
        data.user.user_metadata?.role === "admin" ||
        data.user.app_metadata?.role === "admin" ||
        data.user.email?.endsWith("@goformed.co.uk");

      if (!isUserAdmin) {
        // ✅ FIXED: Sign out non-admin users immediately
        await supabase.auth.signOut();
        throw new Error("Access denied. Admin privileges required.");
      }

      // ✅ FIXED: Log admin activity
      try {
        await supabase.rpc("log_activity", {
          p_user_id: data.user.id,
          p_action: "admin_login",
          p_description: "Admin user logged in",
          p_metadata: {
            ip: "unknown", // You can implement IP detection if needed
            user_agent: navigator.userAgent,
          },
        });
      } catch (logError) {
        console.warn("Failed to log admin activity:", logError);
        // Don't fail login if logging fails
      }

      // ✅ FIXED: Redirect to admin dashboard
      navigate("/admin", { replace: true });
    } catch (error) {
      console.error("Admin login error:", error);

      // ✅ IMPROVED: Better error messages
      if (error.message === "Invalid login credentials") {
        setError("Invalid email or password. Please try again.");
      } else if (error.message.includes("Access denied")) {
        setError("Access denied. Admin privileges required.");
      } else if (error.message.includes("Email not confirmed")) {
        setError("Please confirm your email address before signing in.");
      } else {
        setError(
          error.message || "An unexpected error occurred. Please try again."
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
              Admin Access
            </CardTitle>
            <p className="text-gray-600 text-sm">
              Secure login for authorized administrators
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
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Admin Email
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
                </div>

                <div>
                  <Label
                    htmlFor="password"
                    className="text-gray-700 font-medium"
                  >
                    Password
                  </Label>
                  <div className="relative mt-2">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter admin password"
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
                className="w-full h-12 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <Shield className="mr-2 h-4 w-4" />
                    Sign In to Admin
                  </>
                )}
              </Button>
            </form>

            {/* Security Notice */}
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-semibold text-yellow-800 mb-1">
                    Security Notice
                  </h4>
                  <p className="text-xs text-yellow-700">
                    This is a secure admin area. All access attempts are logged
                    and monitored. Only authorized GoFormed administrators
                    should access this system.
                  </p>
                </div>
              </div>
            </div>

            {/* Back to Main Site */}
            <div className="mt-6 text-center">
              <button
                onClick={() => navigate("/")}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                ← Back to Main Site
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} GoFormed. Admin Panel v2.0
          </p>
        </div>
      </motion.div>
    </div>
  );
}
