// src/contexts/AuthContext.jsx - Çıkış İşlemi Güçlendirildi ve Temizlik Eklendi
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/supabase";
import { AUTH_CONFIG } from "@/config/auth";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(0);
  const sessionIntervalRef = useRef(null);
  const navigate = useNavigate();

  // ✅ GÜÇLENDİRİLMİŞ ÇIKIŞ FONKSİYONU
  const signOut = async (options = { navigate: true, message: null }) => {
    clearInterval(sessionIntervalRef.current); // Zamanlayıcıyı durdur

    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    }

    // Uygulama state'ini manuel olarak temizle
    setUser(null);
    setSession(null);
    setProfile(null);
    setIsAdmin(false);
    setShowSessionWarning(false);

    // Yönlendirme yap
    if (options.navigate) {
      navigate("/login", {
        replace: true,
        state: { message: options.message },
      });
    }
  };

  const handleSessionExpired = () => {
    signOut({
      navigate: true,
      message: "Your session has expired. Please sign in again.",
    });
    // Sayfayı yenilemek, kalıntı state'leri temizler.
    window.location.reload();
  };

  const extendSession = async () => {
    const { error } = await supabase.auth.refreshSession();
    if (!error) setShowSessionWarning(false);
  };

  useEffect(() => {
    const getInitialSession = async () => {
      const {
        data: { session: initialSession },
      } = await supabase.auth.getSession();

      if (initialSession) {
        setSession(initialSession);
        setUser(initialSession.user);
        await fetchUserProfile(initialSession.user.id);
      }

      setLoading(false);
    };

    getInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (event === "SIGNED_IN") {
        fetchUserProfile(newSession.user.id);
      } else if (event === "SIGNED_OUT") {
        // Çıkış yapıldığında tüm state'i temizle
        setProfile(null);
        setIsAdmin(false);
        setShowSessionWarning(false);
        clearInterval(sessionIntervalRef.current);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkSessionExpiry = () => {
    const currentSession = session;
    if (!currentSession || !currentSession.expires_at) return;
    const timeLeft = currentSession.expires_at * 1000 - Date.now();
    if (timeLeft <= 0) handleSessionExpired();
    else if (timeLeft <= AUTH_CONFIG.SESSION.WARNING_TIME) {
      setShowSessionWarning(true);
      setSessionTimeLeft(Math.ceil(timeLeft / 60000));
    } else {
      setShowSessionWarning(false);
    }
  };

  useEffect(() => {
    if (session) {
      clearInterval(sessionIntervalRef.current);
      sessionIntervalRef.current = setInterval(
        checkSessionExpiry,
        AUTH_CONFIG.SESSION.CHECK_INTERVAL
      );
    } else {
      clearInterval(sessionIntervalRef.current);
    }
    return () => clearInterval(sessionIntervalRef.current);
  }, [session]);

  const fetchUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
      if (data) {
        setProfile(data);
        setIsAdmin(data.role === "admin");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const value = {
    user,
    session,
    profile,
    loading,
    isAdmin,
    signOut,
    showSessionWarning,
    sessionTimeLeft,
    extendSession,
    handleSessionExpired,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
