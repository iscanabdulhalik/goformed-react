// src/pages/LoginPage.jsx

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { sendSignInLinkToEmail, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AuthLayout,
  AuthContent,
  AuthImage,
} from "@/components/layout/AuthLayout";
import { CheckCircle } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

  const handlePasswordlessLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const actionCodeSettings = {
      url: `${window.location.origin}/finish-login`,
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem("emailForSignIn", email);
      setLinkSent(true);
    } catch (err) {
      setError("Failed to send link. Please check the email and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/dashboard");
    } catch (err) {
      setError("Failed to sign in with Google.");
    }
  };

  return (
    <AuthLayout>
      <AuthImage />
      <AuthContent>
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
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
                  <p className="text-sm font-medium text-destructive">
                    {error}
                  </p>
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
                disabled={loading}
              >
                Sign In with Google
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
