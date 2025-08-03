// src/supabase.js - Enhanced with better error handling and fallbacks
import { createClient } from "@supabase/supabase-js";

// Environment variables with fallbacks and better error handling
const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL ||
  process.env.SUPABASE_URL;

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_ANON_KEY;

// Development mode check
const isDevelopment =
  import.meta.env.DEV || process.env.NODE_ENV === "development";

if (!supabaseUrl || !supabaseAnonKey) {
  const errorMessage = `Missing Supabase configuration:
  - URL: ${supabaseUrl ? "✓" : "✗ Missing"}
  - Anon Key: ${supabaseAnonKey ? "✓" : "✗ Missing"}
  
  Please check your environment variables:
  ${isDevelopment ? "- .env.local file" : "- Deployment environment variables"}
  - VITE_SUPABASE_URL
  - VITE_SUPABASE_ANON_KEY`;

  console.error(errorMessage);

  if (isDevelopment) {
    throw new Error(
      "Supabase configuration missing. Check your .env.local file."
    );
  } else {
    // Production'da daha graceful handling
    console.error("Supabase configuration missing in production");
  }
}

// Supabase client configuration
const supabaseConfig = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: "pkce",
  },
  global: {
    headers: {
      "X-Client-Info": "goformed-web-app",
    },
  },
};

// Create the client with error handling
export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, supabaseConfig)
    : null;

// Export configuration check function
export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey && supabase);
};

// Admin client factory (for admin operations)
export const createAdminClient = () => {
  const serviceRoleKey =
    import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey && isDevelopment) {
    console.warn("Service Role Key not found. Admin operations may not work.");
    return supabase; // Fallback to regular client in development
  }

  if (!serviceRoleKey) {
    throw new Error("Service Role Key required for admin operations");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};

// Debug information (development only)
if (isDevelopment) {
  console.log("🔧 Supabase Configuration:", {
    url: supabaseUrl ? "✓ Configured" : "✗ Missing",
    anonKey: supabaseAnonKey ? "✓ Configured" : "✗ Missing",
    client: supabase ? "✓ Initialized" : "✗ Failed",
  });
}
