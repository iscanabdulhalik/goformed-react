// src/lib/supabase-admin.js - TAMAMEN YENİ VERSİYON
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    "Supabase URL and Service Role Key must be defined in .env.local file"
  );
}

// Admin client with service role key (full access)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Helper functions for admin operations
export const adminHelpers = {
  // Get all users with email addresses
  async getAllUsers() {
    try {
      console.log("[AdminHelpers] 👥 Fetching all users...");
      const { data, error } = await supabaseAdmin.auth.admin.listUsers();
      if (error) throw error;

      const users = data.users.map((user) => ({
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
        last_sign_in_at: user.last_sign_in_at,
        created_at: user.created_at,
        profile: null,
      }));

      console.log(`[AdminHelpers] ✅ Found ${users.length} users`);
      return users;
    } catch (error) {
      console.error("[AdminHelpers] ❌ Error fetching users:", error);
      throw error;
    }
  },

  // Get user by ID
  async getUserById(userId) {
    try {
      const { data, error } = await supabaseAdmin.auth.admin.getUserById(
        userId
      );
      if (error) throw error;
      return data.user;
    } catch (error) {
      console.error("[AdminHelpers] ❌ Error fetching user:", error);
      throw error;
    }
  },

  // Send email notification - GELİŞTİRİLMİŞ VERSİYON
  async sendEmailNotification(recipients, subject, message) {
    const MAX_RETRIES = 2;

    async function sendWithRetry(retryCount = 0) {
      try {
        console.log(
          `[AdminHelpers] 📧 Starting email process for ${
            recipients.length
          } recipients (attempt ${retryCount + 1})`
        );

        // Rate limit kontrolü
        const { data: rateLimitOk, error: rateLimitError } =
          await supabaseAdmin.rpc("check_rate_limit");

        if (rateLimitError) {
          console.warn(
            "[AdminHelpers] ⚠️ Rate limit check failed:",
            rateLimitError.message
          );
        } else if (!rateLimitOk) {
          throw new Error("Rate limit exceeded. Please try again later.");
        }

        // Email jobs hazırla
        const emailJobs = recipients.map((email) => ({
          recipient: email,
          subject: subject,
          template_name: "notification",
          template_data: { message },
          status: "pending",
          attempts: 0,
        }));

        console.log(
          `[AdminHelpers] 📝 Processing ${emailJobs.length} jobs with transaction...`
        );

        // Transaction ile email'leri kuyruğa ekle
        const { data, error } = await supabaseAdmin.rpc("queue_emails", {
          email_jobs: emailJobs,
        });

        if (error) {
          console.error("[AdminHelpers] ❌ Transaction failed:", error);
          throw error;
        }

        const queuedCount = data?.length || 0;
        console.log(
          `[AdminHelpers] ✅ Successfully queued ${queuedCount} unique emails`
        );

        if (queuedCount === 0) {
          return {
            success: true,
            message: "All emails were recent duplicates (24h window)",
            count: 0,
          };
        }

        // Email processor'ı tetikle
        try {
          console.log("[AdminHelpers] 🚀 Triggering email processor...");

          const processorResponse = await fetch(
            `${supabaseUrl}/functions/v1/email-processor`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${supabaseAnonKey}`,
              },
              body: JSON.stringify({
                trigger: "notification_send",
                timestamp: Date.now(),
                batch_size: queuedCount,
              }),
            }
          );

          if (processorResponse.ok) {
            const result = await processorResponse.json();
            console.log("[AdminHelpers] ✅ Email processor triggered:", result);
          } else {
            const errorText = await processorResponse.text();
            console.warn("[AdminHelpers] ⚠️ Processor trigger failed:", {
              status: processorResponse.status,
              error: errorText,
            });
          }
        } catch (processorError) {
          console.warn(
            "[AdminHelpers] ⚠️ Could not trigger processor:",
            processorError.message
          );
          console.log(
            "[AdminHelpers] 📌 Emails queued, will be processed automatically"
          );
        }

        return {
          success: true,
          data,
          count: queuedCount,
          message: `${queuedCount} emails queued successfully`,
        };
      } catch (error) {
        if (retryCount < MAX_RETRIES) {
          console.warn(
            `[AdminHelpers] ⚠️ Retry ${
              retryCount + 1
            }/${MAX_RETRIES} after error:`,
            error.message
          );
          await new Promise((resolve) =>
            setTimeout(resolve, 1000 * (retryCount + 1))
          );
          return sendWithRetry(retryCount + 1);
        }

        console.error("[AdminHelpers] ❌ All retries failed:", error);
        throw error;
      }
    }

    return sendWithRetry();
  },
};
