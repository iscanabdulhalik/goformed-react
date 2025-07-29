// src/pages/FinishLoginPage.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { auth } from "@/supabase";
import Loader from "@/components/ui/Loader"; // Şık yükleme animasyonumuzu kullanalım
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function FinishLoginPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [needsEmail, setNeedsEmail] = useState(false);

  useEffect(() => {
    // Sayfa yüklendiğinde linki kontrol et
    const completeSignIn = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let storedEmail = window.localStorage.getItem("emailForSignIn");

        if (!storedEmail) {
          // Eğer email localStorage'da yoksa (örneğin başka bir cihazda link açıldıysa)
          // kullanıcıdan email adresini tekrar girmesini iste
          setNeedsEmail(true);
          setLoading(false);
          return;
        }

        try {
          await signInWithEmailLink(auth, storedEmail, window.location.href);
          window.localStorage.removeItem("emailForSignIn");
          navigate("/dashboard");
        } catch (err) {
          setError(
            "Giriş linki geçersiz veya süresi dolmuş. Lütfen tekrar deneyin."
          );
          setLoading(false);
        }
      } else {
        setError("Bu geçerli bir giriş linki değil.");
        setLoading(false);
      }
    };

    completeSignIn();
  }, [navigate]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailLink(auth, email, window.location.href);
      window.localStorage.removeItem("emailForSignIn");
      navigate("/dashboard");
    } catch (err) {
      setError(
        "Girdiğiniz e-posta adresi linkle eşleşmiyor. Lütfen tekrar deneyin."
      );
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  // Eğer email'e ihtiyaç varsa, kullanıcıya bir form göster
  if (needsEmail) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Verify Your Email</CardTitle>
            <CardDescription>
              To complete your sign-in, please provide your email address again.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full">
                Confirm Email & Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Eğer bir hata varsa, hatayı göster
  return (
    <div className="flex items-center justify-center min-h-screen text-center">
      <p className="text-destructive">{error}</p>
    </div>
  );
}
