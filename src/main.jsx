// src/main.jsx - Düzeltilmiş versiyon
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// GitHub Pages SPA routing fix
const handleGitHubPagesSPA = () => {
  const redirect = sessionStorage.redirect;
  delete sessionStorage.redirect;
  if (redirect && redirect !== location.href) {
    history.replaceState(null, null, redirect);
  }
};

// Check if we're on GitHub Pages and handle routing
if (window.location.hostname.includes("github.io")) {
  handleGitHubPagesSPA();
}

// Development modunda debug araçlarını yükle
if (import.meta.env.DEV) {
  // Debug araçlarını yükle - hata olursa devam et
  Promise.all([
    import("./utils/shopify-debug.js").catch(() => null),
    import("./utils/debug.js").catch(() => null),
  ]).then(([shopifyModule, debugModule]) => {
    if (shopifyModule) {
      console.log(
        "🛠️ Shopify debug tools loaded! Try: testShopify.connection()"
      );
    }
    if (debugModule) {
      console.log(
        "🔧 GoFormed debug tools loaded! Try: goformedDebug.runAllTests()"
      );
    }
  });
}

// Error boundary for the entire app
class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-4">
              Please refresh the page or try again later.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AppErrorBoundary>
      <BrowserRouter basename={import.meta.env.BASE_URL || "/"}>
        <App />
      </BrowserRouter>
    </AppErrorBoundary>
  </React.StrictMode>
);
