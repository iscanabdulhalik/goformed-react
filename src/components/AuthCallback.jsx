// src/components/AuthCallback.jsx - YARIŞ DURUMUNU ÇÖZEN NİHAİ VERSİYON
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/supabase";
import { useAuth } from "@/contexts/AuthContext";
import Loader from "@/components/ui/Loader";

export default function AuthCallback() {
  const navigate = useNavigate();
  const { user, isAdmin, loading: authContextLoading } = useAuth();

  // Bu bileşenin kendi içindeki işlemin tamamlanıp tamamlanmadığını takip etmek için
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState(null);

  // 1. ADIM: Sayfa yüklendiğinde SADECE oturumun kurulmasını tetikle.
  // Bu useEffect'in görevi yönlendirme yapmak DEĞİLDİR. Sadece Supabase'in
  // `onAuthStateChange` olayını tetiklemesini sağlamaktır.
  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (error) {
          console.error("Callback session error:", error);
          setError("Failed to process authentication. Please try again.");
        }
        // Oturum alma işlemi tamamlandı, artık yönlendirme için AuthContext'i dinleyebiliriz.
        setIsProcessing(false);
      })
      .catch((err) => {
        setError("An unexpected error occurred during authentication.");
        setIsProcessing(false);
      });
  }, []);

  // 2. ADIM: AuthContext'in ve bu bileşenin hazır olmasını bekle, SONRA yönlendir.
  // Bu useEffect, hem AuthContext'in yüklemeyi bitirmesini (`authContextLoading` false olmalı)
  // hem de yukarıdaki oturum işleminin bitmesini (`isProcessing` false olmalı) bekler.
  useEffect(() => {
    // Eğer hala bir işlem devam ediyorsa, bekle.
    if (authContextLoading || isProcessing) {
      return;
    }

    // Eğer bir hata oluştuysa, kullanıcıyı bilgilendirerek login'e gönder.
    if (error) {
      navigate("/login", { replace: true, state: { message: error } });
      return;
    }

    // Artık hem context hem de callback işlemi hazır. Güvenli bir şekilde yönlendirme yapabiliriz.
    if (user) {
      const authFlow = sessionStorage.getItem("authFlow") || "user";
      sessionStorage.removeItem("authFlow");

      if (authFlow === "admin") {
        if (isAdmin) {
          // Admin giriş akışı VE kullanıcı gerçekten admin ise:
          navigate("/admin", { replace: true });
        } else {
          // Admin giriş akışı AMA kullanıcı admin değilse (güvenlik):
          supabase.auth.signOut();
          navigate("/admin/login", {
            replace: true,
            state: { message: "Admin authorization failed." },
          });
        }
      } else {
        // Standart kullanıcı giriş akışı ise:
        navigate("/dashboard", { replace: true });
      }
    } else {
      // Eğer tüm işlemler bitti ve hala kullanıcı yoksa, bir sorun var demektir.
      navigate("/login", {
        replace: true,
        state: { message: "Sign in failed. Please try again." },
      });
    }
  }, [user, isAdmin, authContextLoading, isProcessing, error, navigate]);

  // Herhangi bir işlem devam ettiği sürece tam ekran yükleyici göster.
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <Loader />
        <p className="text-muted-foreground">Finalizing authentication...</p>
      </div>
    </div>
  );
}
