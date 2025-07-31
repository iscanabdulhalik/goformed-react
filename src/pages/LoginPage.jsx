// src/pages/LoginPage.jsx - Session expired mesajı ile
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AuthLayout,
  AuthContent,
  AuthImage,
} from "@/components/layout/AuthLayout";
import { CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { getSecureRedirectURL, AUTH_CONFIG } from "@/config/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Session expired mesajını kontrol et
  const sessionMessage = location.state?.message;

  // Check if already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        console.log("Already authenticated, redirecting...");

        // Check user role for proper redirect
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        const redirectPath =
          profile?.role === "admin"
            ? AUTH_CONFIG.REDIRECT_PATHS.ADMIN_LOGIN_SUCCESS
            : AUTH_CONFIG.REDIRECT_PATHS.LOGIN_SUCCESS;

        navigate(redirectPath);
      }
    };
    checkAuth();
  }, [navigate]);

  // Handle URL fragments for OAuth callbacks
  useEffect(() => {
    const handleAuthCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const error = hashParams.get("error");
      const errorDescription = hashParams.get("error_description");

      console.log("URL Hash params:", {
        accessToken: !!accessToken,
        error,
        errorDescription,
        fullHash: window.location.hash,
      });

      if (error) {
        console.error("OAuth Error:", error, errorDescription);
        setError(`Authentication failed: ${errorDescription || error}`);
        setGoogleLoading(false);
        return;
      }

      if (accessToken) {
        console.log("Processing OAuth callback...");
        setGoogleLoading(true);

        try {
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession();

          if (sessionError) {
            console.error("Session error:", sessionError);
            setError("Failed to establish session");
            setGoogleLoading(false);
            return;
          }

          if (session) {
            console.log("✅ Session established:", session.user.email);
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );

            // ✅ Güvenli redirect
            const { data: profile } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", session.user.id)
              .single();

            const redirectPath =
              profile?.role === "admin"
                ? AUTH_CONFIG.REDIRECT_PATHS.ADMIN_LOGIN_SUCCESS
                : AUTH_CONFIG.REDIRECT_PATHS.LOGIN_SUCCESS;

            navigate(redirectPath);
          } else {
            console.log("No session found after OAuth");
            setError("Authentication failed - no session");
            setGoogleLoading(false);
          }
        } catch (err) {
          console.error("OAuth processing error:", err);
          setError("Authentication processing failed");
          setGoogleLoading(false);
        }
      }
    };

    if (window.location.hash) {
      handleAuthCallback();
    }
  }, [navigate]);

  const handlePasswordlessLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // ✅ Input validation
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("Please enter a valid email address");
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          emailRedirectTo: getSecureRedirectURL(
            AUTH_CONFIG.REDIRECT_PATHS.LOGIN_SUCCESS
          ),
        },
      });

      if (error) throw error;

      setLinkSent(true);
    } catch (err) {
      console.error("Magic link error:", err);
      setError(err.error_description || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");

    console.log("Starting Google OAuth...");

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getSecureRedirectURL("/login"), // ✅ Güvenli redirect
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });

      console.log("OAuth initiation result:", { data, error });

      if (error) {
        console.error("OAuth initiation error:", error);
        throw error;
      }

      console.log("OAuth popup/redirect should have opened...");
    } catch (err) {
      console.error("Google login error:", err);
      setError(err.error_description || err.message || "Google login failed");
      setGoogleLoading(false);
    }
  };

  // Show loading state if Google authentication is in progress
  if (googleLoading) {
    return (
      <AuthLayout>
        <AuthImage />
        <AuthContent>
          <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
              <h1 className="text-2xl font-semibold tracking-tight">
                Completing Sign In...
              </h1>
              <p className="text-sm text-muted-foreground">
                Please wait while we complete your Google authentication.
              </p>
            </div>
          </div>
        </AuthContent>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthImage />
      <AuthContent>
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          {/* Session Expired Message */}
          {sessionMessage && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">
                    Session Expired
                  </h3>
                  <p className="text-sm text-yellow-700 mt-1">
                    {sessionMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          {linkSent ? (
            <div className="flex flex-col items-center space-y-4 text-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <h1 className="text-2xl font-semibold tracking-tight">
                Check Your Inbox!
              </h1>
              <p className="text-sm text-muted-foreground">
                We've sent a magic sign-in link to <strong>{email}</strong>.
                Please click the link to continue.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setLinkSent(false);
                  setEmail("");
                }}
              >
                Use a different email
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Sign In or Create Account
                </h1>
                <p className="text-sm text-muted-foreground">
                  Enter your email below to receive a sign-in link.
                </p>
              </div>

              <form onSubmit={handlePasswordlessLogin} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center">
                      <AlertTriangle className="h-4 w-4 text-red-600 mr-2" />
                      <p className="text-sm font-medium text-red-800">
                        {error}
                      </p>
                    </div>
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Sending..." : "Send Sign-In Link"}
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={loading || googleLoading}
                className="w-full"
              >
                {googleLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                    Signing in with Google...
                  </>
                ) : (
                  "Sign In with Google"
                )}
              </Button>

              <p className="px-8 text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Sign up
                </Link>
              </p>
            </>
          )}
        </div>
      </AuthContent>
    </AuthLayout>
  );
}
