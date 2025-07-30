// src/App.jsx - Admin routes eklendi
import React, { useState, useEffect } from "react";
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

// Session timeout: 30 dakika
const SESSION_TIMEOUT = 30 * 60 * 1000;

const App = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [initialized, setInitialized] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // URL hash parametrelerini handle et (Supabase auth callback için)
  useEffect(() => {
    const handleAuthCallback = async () => {
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");
      const tokenType = hashParams.get("token_type");

      if (accessToken && tokenType === "bearer") {
        console.log("🔑 Processing auth callback...");

        try {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error("Auth callback error:", error);
          } else {
            console.log("✅ Auth callback successful");
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname
            );

            // Check if admin and redirect accordingly
            const { data: profile } = await supabase
              .from("profiles")
              .select("role")
              .eq("id", data.user.id)
              .single();

            if (profile?.role === "admin") {
              navigate("/admin", { replace: true });
            } else {
              navigate("/dashboard", { replace: true });
            }
          }
        } catch (error) {
          console.error("Session setting error:", error);
        }
      }
    };

    if (window.location.hash.includes("access_token")) {
      handleAuthCallback();
    }
  }, [navigate]);

  // Kullanıcı aktivitesini takip et
  useEffect(() => {
    const updateActivity = () => {
      setLastActivity(Date.now());
    };

    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
      "click",
    ];
    events.forEach((event) => {
      document.addEventListener(event, updateActivity, true);
    });

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, updateActivity, true);
      });
    };
  }, []);

  // Session timeout kontrolü
  useEffect(() => {
    if (!session) return;

    const checkTimeout = () => {
      const now = Date.now();
      if (now - lastActivity > SESSION_TIMEOUT) {
        handleLogout();
      }
    };

    const interval = setInterval(checkTimeout, 60000);
    return () => clearInterval(interval);
  }, [session, lastActivity]);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      setSession(null);

      // Redirect based on current location
      if (location.pathname.startsWith("/admin")) {
        navigate("/admin/login");
      } else {
        navigate("/login");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // Ana auth listener
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error("Session error:", error);
          setSession(null);
        } else if (mounted) {
          setSession(session);

          if (session?.user) {
            const pendingRequest = localStorage.getItem("pendingRequest");
            if (pendingRequest) {
              handlePendingRequest(JSON.parse(pendingRequest), session.user);
            }
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        if (mounted) setSession(null);
      } finally {
        if (mounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log("Auth event:", event, session?.user?.email);

      setSession(session);

      if (event === "SIGNED_IN" && session) {
        // Check if user is admin
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        // Redirect based on role and current location
        if (profile?.role === "admin" && location.pathname === "/admin/login") {
          navigate("/admin", { replace: true });
        } else if (
          profile?.role !== "admin" &&
          (location.pathname === "/login" || location.pathname === "/register")
        ) {
          navigate("/dashboard", { replace: true });
        }
      }

      if (event === "SIGNED_OUT") {
        if (location.pathname.startsWith("/admin")) {
          navigate("/admin/login", { replace: true });
        } else {
          navigate("/login", { replace: true });
        }
      }

      if (session?.user) {
        const pendingRequest = localStorage.getItem("pendingRequest");
        if (pendingRequest) {
          handlePendingRequest(JSON.parse(pendingRequest), session.user);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, location.pathname]);

  // URL hata parametrelerini temizle
  useEffect(() => {
    const url = new URL(window.location);
    if (url.searchParams.has("error")) {
      const newUrl = new URL(window.location);
      newUrl.searchParams.delete("error");
      newUrl.searchParams.delete("error_code");
      newUrl.searchParams.delete("error_description");
      window.history.replaceState({}, "", newUrl.pathname);
    }
  }, []);

  const handlePendingRequest = async (requestData, user) => {
    try {
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        full_name: requestData.fullName,
      });

      if (profileError) throw profileError;

      const { error: requestError } = await supabase
        .from("company_requests")
        .insert({
          user_id: user.id,
          company_name: requestData.companyName,
          package_name: requestData.packageName,
          user_details: {
            fullName: requestData.fullName,
            email: requestData.email,
          },
        });

      if (requestError) throw requestError;

      localStorage.removeItem("pendingRequest");
      console.log("Pending request successfully processed");
    } catch (error) {
      console.error("Error processing pending request:", error);
    }
  };

  // Admin Guard Component
  const AdminGuard = ({ children }) => {
    const [adminLoading, setAdminLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
      const checkAdmin = async () => {
        try {
          if (!session?.user) {
            setAdminLoading(false);
            return;
          }

          const { data: profile } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();

          setIsAdmin(profile?.role === "admin");
        } catch (error) {
          console.error("Admin check error:", error);
          setIsAdmin(false);
        } finally {
          setAdminLoading(false);
        }
      };

      checkAdmin();
    }, [session]);

    if (adminLoading) return <Loader />;

    if (!session) {
      return <Navigate to="/admin/login" replace />;
    }

    if (!isAdmin) {
      return <Navigate to="/admin/login" replace />;
    }

    return children;
  };

  // Loading durumunda
  if (loading || !initialized) {
    return <Loader />;
  }

  const user = session?.user;

  return (
    <ErrorBoundary>
      <Routes>
        {/* Ana sayfa */}
        <Route
          path="/"
          element={
            <Layout>
              <HomePage />
            </Layout>
          }
        />

        {/* User Auth sayfaları */}
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

        {/* User Dashboard - korumalı rotalar */}
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

        {/* Admin Auth */}
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Admin Dashboard - korumalı rotalar */}
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

        {/* 404 - Bulunamayan sayfalar */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default App;
