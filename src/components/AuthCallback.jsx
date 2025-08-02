// src/components/AuthCallback.jsx - YARIŞ DURUMUNU ÇÖZEN NİHAİ VERSİYON
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/supabase";
import { useAuth } from "@/contexts/AuthContext";
import Loader from "@/components/ui/Loader";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authContextLoading } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) {
          console.error("Callback session error:", error);
          setError("Failed to process authentication. Please try again.");
        }
        setIsProcessing(false);
      })
      .catch((err) => {
        setError("An unexpected error occurred during authentication.");
        setIsProcessing(false);
      });
  }, []);

  useEffect(() => {
    if (authContextLoading || isProcessing) {
      return;
    }

    if (error) {
      navigate("/login", { replace: true, state: { message: error } });
      return;
    }

    if (user) {
      const authFlow = sessionStorage.getItem("authFlow") || "user";
      sessionStorage.removeItem("authFlow");

      if (authFlow === "admin") {
        if (isAdmin) {
          navigate("/admin", { replace: true });
        } else {
          supabase.auth.signOut();
          navigate("/admin/login", {
            replace: true,
            state: { message: "Admin authorization failed." },
          });
        }
      } else {
        navigate("/dashboard", { replace: true });
      }
    } else {
      navigate("/login", {
        replace: true,
        state: { message: "Sign in failed. Please try again." },
      });
    }
  }, [user, isAdmin, authContextLoading, isProcessing, error, navigate]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader />
        <p className="text-muted-foreground">Finalizing authentication...</p>
      </div>
    </div>
  );
}
