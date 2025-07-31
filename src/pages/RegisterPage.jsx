// src/pages/RegisterPage.jsx - Redirect URL fix
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AuthLayout,
  AuthContent,
  AuthImage,
} from "@/components/layout/AuthLayout";
import { CheckCircle } from "lucide-react";
import { getSecureRedirectURL, AUTH_CONFIG } from "@/config/auth";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const handleEmailRegister = async (e) => {
    e.preventDefault();

    // ✅ Enhanced validation
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    // Check password strength
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);

    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      setError(
        "Password must contain at least one uppercase letter, one lowercase letter, and one number."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          emailRedirectTo: getSecureRedirectURL(
            AUTH_CONFIG.REDIRECT_PATHS.LOGIN_SUCCESS
          ),
          data: {
            email_confirm: true, // Require email confirmation
          },
        },
      });

      if (error) throw error;

      setVerificationSent(true);
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.error_description || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: getSecureRedirectURL(
            AUTH_CONFIG.REDIRECT_PATHS.LOGIN_SUCCESS
          ),
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(err.error_description || err.message);
    }
  };

  return (
    <AuthLayout>
      <AuthImage />
      <AuthContent>
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          {verificationSent ? (
            <div className="flex flex-col items-center space-y-4 text-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <h1 className="text-2xl font-semibold tracking-tight">
                Verify Your Email
              </h1>
              <p className="text-sm text-muted-foreground">
                We've sent a verification link to <strong>{email}</strong>.
                Please check your inbox and follow the link to activate your
                account.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                <p className="text-sm text-blue-800">
                  <strong>Important:</strong> You must verify your email before
                  you can sign in. The verification link will expire in 24
                  hours.
                </p>
              </div>
              <Button onClick={() => navigate("/login")}>
                Back to Sign In
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Create an Account
                </h1>
                <p className="text-sm text-muted-foreground">
                  Enter your email below to create your account.
                </p>
              </div>
              <form onSubmit={handleEmailRegister} className="grid gap-4">
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
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Must be at least 8 characters with uppercase, lowercase, and
                    numbers
                  </p>
                </div>
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-red-800">{error}</p>
                  </div>
                )}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating Account..." : "Create Account"}
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
                onClick={handleGoogleRegister}
                disabled={loading}
              >
                Sign Up with Google
              </Button>
              <p className="px-8 text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to="/login"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </AuthContent>
    </AuthLayout>
  );
}
