// src/components/AuthCallback.jsx - Dedicated auth callback handler
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/supabase";
import Loader from "@/components/ui/Loader";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log("🔄 Processing auth callback...");

        // Get the session after OAuth callback
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("❌ Session error:", error);
          navigate("/login?error=" + encodeURIComponent(error.message));
          return;
        }

        if (session) {
          console.log("✅ Session found:", session.user.email);

          // Ensure profile exists
          const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .maybeSingle();

          if (!profile && !profileError) {
            console.log("🔧 Creating profile for new user...");
            await supabase.from("profiles").insert({
              id: session.user.id,
              full_name:
                session.user.user_metadata?.full_name ||
                session.user.email?.split("@")[0],
              role: "user",
            });
          }

          // Redirect based on role
          const userRole = profile?.role || "user";
          if (userRole === "admin") {
            navigate("/admin");
          } else {
            navigate("/dashboard");
          }
        } else {
          console.log("❌ No session found");
          navigate(
            "/login?error=" + encodeURIComponent("Authentication failed")
          );
        }
      } catch (error) {
        console.error("❌ Auth callback error:", error);
        navigate("/login?error=" + encodeURIComponent("Authentication failed"));
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader />
        <p className="mt-4 text-gray-600">Completing your sign in...</p>
      </div>
    </div>
  );
}
