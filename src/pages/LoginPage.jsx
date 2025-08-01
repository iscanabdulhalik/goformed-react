// src/pages/LoginPage.jsx - Gereksiz useEffect Kaldırıldı
import React, { useState } from "react";
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
import { getSecureRedirectURL } from "@/config/auth";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const sessionMessage = location.state?.message;

  // ❗ ÖNEMLİ: Buradaki useEffect kaldırıldı.
  // Bu kontrol artık sadece GuestRoute tarafından yapılıyor.
  // Bu sayede çift kontrol ve yarış durumu riski ortadan kalktı.

  const handlePasswordlessLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("Please enter a valid email address");
      }
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: { emailRedirectTo: getSecureRedirectURL("/dashboard") },
      });
      if (error) throw error;
      setLinkSent(true);
    } catch (err) {
      setError(err.error_description || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError("");
    sessionStorage.setItem("authFlow", "user");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: getSecureRedirectURL("/auth/callback") },
    });
    if (error) {
      setError(error.error_description || error.message);
      setGoogleLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthImage />
      <AuthContent>
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          {sessionMessage && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-center">
                <Clock className="h-5 w-5 text-yellow-600 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-yellow-800">
                    Session Message
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
                  Sign In
                </h1>
                <p className="text-sm text-muted-foreground">
                  Enter your email or use a provider to sign in.
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
                    disabled={loading || googleLoading}
                  />
                </div>
                {error && (
                  <p className="text-sm font-medium text-destructive">
                    {error}
                  </p>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading || googleLoading}
                >
                  {loading ? "Sending..." : "Send Sign-In Link"}
                </Button>
              </form>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleGoogleLogin}
                disabled={loading || googleLoading}
                className="w-full"
              >
                {googleLoading ? "Redirecting..." : "Sign In with Google"}
              </Button>
              <p className="px-8 text-center text-sm text-muted-foreground mt-4">
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
