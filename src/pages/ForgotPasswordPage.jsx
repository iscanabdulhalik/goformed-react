import React, { useState } from "react";
import { Link } from "react-router-dom";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AuthLayout,
  AuthContent,
  AuthImage,
} from "@/components/layout/AuthLayout";
import { CheckCircle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await sendPasswordResetEmail(auth, email);
      setEmailSent(true);
    } catch (err) {
      setError(
        "Failed to send reset link. Please ensure the email is correct."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <AuthImage />
      <AuthContent>
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          {emailSent ? (
            <div className="flex flex-col items-center space-y-4 text-center">
              <CheckCircle className="h-16 w-16 text-green-500" />
              <h1 className="text-2xl font-semibold tracking-tight">
                Reset Link Sent!
              </h1>
              <p className="text-sm text-muted-foreground">
                A link to reset your password has been sent to{" "}
                <strong>{email}</strong>. Please check your inbox.
              </p>
              <Button variant="outline" asChild>
                <Link to="/login">Back to Sign In</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-col space-y-2 text-center">
                <h1 className="text-2xl font-semibold tracking-tight">
                  Forgot Password?
                </h1>
                <p className="text-sm text-muted-foreground">
                  No problem. Enter your email and we'll send you a link to
                  reset it.
                </p>
              </div>
              <form onSubmit={handleResetPassword} className="grid gap-4">
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
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
              <p className="text-center text-sm text-muted-foreground">
                Remembered your password?{" "}
                <Link
                  to="/login"
                  className="underline underline-offset-4 hover:text-primary"
                >
                  Sign In
                </Link>
              </p>
            </>
          )}
        </div>
      </AuthContent>
    </AuthLayout>
  );
}
