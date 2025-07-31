// src/config/auth.js - Yeni dosya
export const AUTH_CONFIG = {
  // ✅ Güvenli: Sabit URL listesi
  ALLOWED_REDIRECT_URLS: {
    development: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
    ],
    production: [
      "https://goformed.co.uk",
      "https://www.goformed.co.uk",
      // Vercel preview URLs için pattern (optional)
      "https://goformed-react-*.vercel.app",
    ],
  },

  // Default paths
  REDIRECT_PATHS: {
    LOGIN_SUCCESS: "/dashboard",
    ADMIN_LOGIN_SUCCESS: "/admin",
    LOGOUT: "/login",
    PASSWORD_RESET: "/password-reset",
  },

  // Session configuration
  SESSION: {
    TIMEOUT: 30 * 60 * 1000, // 30 minutes
    WARNING_TIME: 5 * 60 * 1000, // 5 minutes warning
    CHECK_INTERVAL: 60 * 1000, // Check every minute
  },
};

/**
 * Gets secure redirect URL based on environment
 * @param {string} path - The path to redirect to
 * @returns {string} - Secure redirect URL
 */
export const getSecureRedirectURL = (path = "/dashboard") => {
  const environment = import.meta.env.PROD ? "production" : "development";
  const allowedUrls = AUTH_CONFIG.ALLOWED_REDIRECT_URLS[environment];

  // Get current origin
  const currentOrigin = window.location.origin;

  // Check if current origin is in allowed list
  const isAllowed = allowedUrls.some((allowedUrl) => {
    if (allowedUrl.includes("*")) {
      // Handle wildcard patterns for Vercel previews
      const pattern = allowedUrl.replace(/\*/g, ".*");
      return new RegExp(pattern).test(currentOrigin);
    }
    return allowedUrl === currentOrigin;
  });

  if (!isAllowed) {
    console.warn(`Unauthorized redirect origin: ${currentOrigin}`);
    // Fallback to first allowed URL
    const fallbackUrl = allowedUrls[0].replace(/\*/g, "goformed-react");
    return `${fallbackUrl}${path}`;
  }

  return `${currentOrigin}${path}`;
};

/**
 * Validates if a redirect URL is safe
 * @param {string} url - URL to validate
 * @returns {boolean} - Whether URL is safe
 */
export const isValidRedirectURL = (url) => {
  try {
    const urlObj = new URL(url);
    const environment = import.meta.env.PROD ? "production" : "development";
    const allowedUrls = AUTH_CONFIG.ALLOWED_REDIRECT_URLS[environment];

    return allowedUrls.some((allowedUrl) => {
      if (allowedUrl.includes("*")) {
        const pattern = allowedUrl.replace(/\*/g, ".*");
        return new RegExp(pattern).test(urlObj.origin);
      }
      return allowedUrl === urlObj.origin;
    });
  } catch {
    return false;
  }
};
