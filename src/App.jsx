// src/App.jsx - Düzeltilmiş versiyon
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { supabase } from "./supabase";

// User pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import MarketplacePage from "./pages/MarketplacePage";
import OrdersPage from "./pages/OrdersPage";
import SettingsPage from "./pages/SettingsPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import RequestDetailsPage from "./pages/RequestDetailsPage";

// Admin pages
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminUserManagement from "./pages/admin/AdminUserManagement";
import AdminNotificationManagement from "./pages/admin/AdminNotificationManagement";

// Layouts
import Layout from "./components/layout/Layout";
import DashboardLayout from "./components/layout/DashboardLayout";
import AdminLayout from "./components/layout/AdminLayout";

// Components
import Loader from "./components/ui/Loader";
import ErrorBoundary from "./components/ErrorBoundary";

// Session ayarları
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 dakika
const ACTIVITY_CHECK_INTERVAL = 60 * 1000; // 1 dakikada bir kontrol
const SESSION_WARNING_TIME = 5 * 60 * 1000; // Son 5 dakikada uyarı

const App = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(0);
  const [user, setUser] = useState(null);

  // UseRef kullanarak render loop'unu önle
  const lastActivityRef = useRef(Date.now());
  const timeoutIntervalRef = useRef(null);
  const activityListenersSetRef = useRef(false);
  const authListenerSetRef = useRef(false);

  const location = useLocation();
  const navigate = useNavigate();

  // Activity update - sadece ref'i güncellesin, state'i değil
  const updateActivity = useCallback(() => {
    const now = Date.now();
    lastActivityRef.current = now;
    setShowSessionWarning(false);
    localStorage.setItem("lastActivity", now.toString());

    // Sadece dev modunda log
    if (import.meta.env.DEV) {
      console.log("👆 Activity at:", new Date(now).toLocaleTimeString());
    }
  }, []);

  // Session expired handler
  const handleSessionExpired = useCallback(async () => {
    console.log("🔒 Session expired, logging out");

    if (timeoutIntervalRef.current) {
      clearInterval(timeoutIntervalRef.current);
      timeoutIntervalRef.current = null;
    }

    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Logout error:", error);
    }

    setSession(null);
    setUser(null);
    setShowSessionWarning(false);
    localStorage.removeItem("lastActivity");

    const redirectPath = location.pathname.startsWith("/admin")
      ? "/admin/login"
      : "/login";
    navigate(redirectPath, {
      replace: true,
      state: { message: "Your session has expired. Please log in again." },
    });
  }, [location.pathname, navigate]);

  // Extend session
  const handleExtendSession = useCallback(() => {
    console.log("🔄 Extending session");
    updateActivity();
  }, [updateActivity]);

  // User role checker
  const checkUserRole = async (userId) => {
    try {
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        console.error("❌ Error checking user role:", error);
        return "user";
      }

      if (!profile) {
        console.log("👤 Creating default profile...");
        const { error: insertError } = await supabase.from("profiles").insert({
          id: userId,
          role: "user",
        });

        if (insertError) {
          console.error("❌ Error creating profile:", insertError);
        }
        return "user";
      }

      return profile.role || "user";
    } catch (error) {
      console.error("❌ Error in checkUserRole:", error);
      return "user";
    }
  };

  // Initialize auth - SADECE BİR KEZ ve navigation logic'i burada
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        console.log("🔐 Initializing auth...");

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("❌ Session error:", error);
        }

        if (mounted) {
          console.log("📋 Session status:", session ? "Found" : "Not found");
          setSession(session);
          setUser(session?.user || null);

          if (session) {
            lastActivityRef.current = Date.now();
            localStorage.setItem(
              "lastActivity",
              lastActivityRef.current.toString()
            );

            // İlk yüklemede kullanıcı rolüne göre yönlendirme yap
            if (
              location.pathname === "/" ||
              location.pathname === "/login" ||
              location.pathname === "/register"
            ) {
              try {
                const userRole = await checkUserRole(session.user.id);
                const redirectPath =
                  userRole === "admin" ? "/admin" : "/dashboard";
                console.log("🚀 Redirecting to:", redirectPath);
                navigate(redirectPath, { replace: true });
              } catch (error) {
                console.error("❌ Role check failed:", error);
                navigate("/dashboard", { replace: true });
              }
            }
          }

          setLoading(false);
          setAuthChecked(true);
        }
      } catch (error) {
        console.error("❌ Auth init error:", error);
        if (mounted) {
          setSession(null);
          setUser(null);
          setLoading(false);
          setAuthChecked(true);
        }
      }
    };

    initializeAuth();

    return () => {
      mounted = false;
    };
  }, []); // Boş dependency - sadece mount'ta çalış

  // Auth listener - SADECE BİR KEZ ve sadece logout için
  useEffect(() => {
    if (authListenerSetRef.current) return;

    console.log("👂 Setting up auth listener...");
    authListenerSetRef.current = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔔 Auth event:", event);

      // Sadece session state'ini güncelle, navigation yapma
      setSession(session);
      setUser(session?.user || null);

      // Sadece SIGNED_OUT event'inde navigation yap
      if (event === "SIGNED_OUT") {
        console.log("👋 User signed out");
        setShowSessionWarning(false);
        localStorage.removeItem("lastActivity");

        const redirectPath = location.pathname.startsWith("/admin")
          ? "/admin/login"
          : "/login";
        navigate(redirectPath, { replace: true });
      }

      // SIGNED_IN durumunda sadece activity'yi güncelle, navigation yapma
      if (event === "SIGNED_IN" && session) {
        console.log("✅ User signed in - updating activity");
        lastActivityRef.current = Date.now();
        localStorage.setItem(
          "lastActivity",
          lastActivityRef.current.toString()
        );
        setShowSessionWarning(false);
      }
    });

    return () => {
      console.log("🧹 Cleaning up auth listener");
      subscription.unsubscribe();
    };
  }, []); // Boş dependency array

  // Activity listeners - sadece bir kez kur
  useEffect(() => {
    if (activityListenersSetRef.current) return;

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
      "keydown",
    ];

    // Throttled activity update - çok sık çağrılmasını önle
    let activityTimeout;
    const throttledUpdate = () => {
      if (activityTimeout) return;
      activityTimeout = setTimeout(() => {
        updateActivity();
        activityTimeout = null;
      }, 1000); // 1 saniyede maksimum 1 kez
    };

    events.forEach((event) => {
      document.addEventListener(event, throttledUpdate, { passive: true });
    });

    const handleFocus = () => {
      const storedActivity = localStorage.getItem("lastActivity");
      if (storedActivity) {
        const storedTime = parseInt(storedActivity);
        if (storedTime > lastActivityRef.current) {
          lastActivityRef.current = storedTime;
        }
      }
      updateActivity();
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", () => {
      console.log("😴 Tab blurred");
    });

    activityListenersSetRef.current = true;

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, throttledUpdate);
      });
      window.removeEventListener("focus", handleFocus);
      if (activityTimeout) {
        clearTimeout(activityTimeout);
      }
      activityListenersSetRef.current = false;
    };
  }, [updateActivity]);

  // Session timeout checker - ayrı interval
  useEffect(() => {
    if (!session) {
      if (timeoutIntervalRef.current) {
        clearInterval(timeoutIntervalRef.current);
        timeoutIntervalRef.current = null;
      }
      return;
    }

    const checkSessionTimeout = () => {
      const now = Date.now();
      const timeSinceActivity = now - lastActivityRef.current;
      const timeLeft = SESSION_TIMEOUT - timeSinceActivity;

      // Session expired
      if (timeSinceActivity >= SESSION_TIMEOUT) {
        console.log("⚠️ Session expired");
        handleSessionExpired();
        return;
      }

      // Show warning
      if (timeLeft <= SESSION_WARNING_TIME && timeLeft > 0) {
        const minutesLeft = Math.ceil(timeLeft / 1000 / 60);
        setSessionTimeLeft(minutesLeft);
        setShowSessionWarning(true);
      } else {
        setShowSessionWarning(false);
      }
    };

    // İlk kontrol
    checkSessionTimeout();

    // Interval başlat
    timeoutIntervalRef.current = setInterval(
      checkSessionTimeout,
      ACTIVITY_CHECK_INTERVAL
    );

    return () => {
      if (timeoutIntervalRef.current) {
        clearInterval(timeoutIntervalRef.current);
        timeoutIntervalRef.current = null;
      }
    };
  }, [session, handleSessionExpired]); // session ve handleSessionExpired'e bağımlı

  // Admin Guard
  const AdminGuard = ({ children }) => {
    const [adminLoading, setAdminLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
      const checkAdmin = async () => {
        if (!session?.user) {
          setAdminLoading(false);
          return;
        }

        try {
          const userRole = await checkUserRole(session.user.id);
          setIsAdmin(userRole === "admin");
        } catch (error) {
          console.error("❌ Admin check error:", error);
          setIsAdmin(false);
        } finally {
          setAdminLoading(false);
        }
      };

      checkAdmin();
    }, [session]);

    if (adminLoading) return <Loader />;
    if (!session) return <Navigate to="/admin/login" replace />;
    if (!isAdmin) return <Navigate to="/admin/login" replace />;

    return children;
  };

  // Loading state
  if (loading || !authChecked) {
    return <Loader />;
  }

  return (
    <ErrorBoundary>
      {/* Session Warning Modal */}
      {showSessionWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-yellow-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-gray-900">
                  Session Expiring Soon
                </h3>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-sm text-gray-700">
                Your session will expire in{" "}
                <strong>
                  {sessionTimeLeft} minute{sessionTimeLeft !== 1 ? "s" : ""}
                </strong>
                . Would you like to extend your session?
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleSessionExpired}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Log Out Now
              </button>
              <button
                onClick={handleExtendSession}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Extend Session
              </button>
            </div>
          </div>
        </div>
      )}

      <Routes>
        <Route
          path="/"
          element={
            <Layout>
              <HomePage />
            </Layout>
          }
        />

        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={
            user ? <Navigate to="/dashboard" replace /> : <RegisterPage />
          }
        />
        <Route
          path="/forgot-password"
          element={
            user ? <Navigate to="/dashboard" replace /> : <ForgotPasswordPage />
          }
        />

        <Route
          path="/dashboard"
          element={
            user ? <DashboardLayout /> : <Navigate to="/login" replace />
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="marketplace" element={<MarketplacePage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="request/:id" element={<RequestDetailsPage />} />
        </Route>

        <Route path="/admin/login" element={<AdminLoginPage />} />

        <Route
          path="/admin"
          element={
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUserManagement />} />
          <Route
            path="companies"
            element={<div>Company Management Coming Soon</div>}
          />
          <Route
            path="notifications"
            element={<AdminNotificationManagement />}
          />
          <Route
            path="automations"
            element={<div>Automations Coming Soon</div>}
          />
          <Route path="reports" element={<div>Reports Coming Soon</div>} />
          <Route
            path="settings"
            element={<div>Admin Settings Coming Soon</div>}
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default App;
