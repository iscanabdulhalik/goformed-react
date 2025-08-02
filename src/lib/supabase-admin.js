// src/lib/supabase-admin.js - Admin client for server-side operations
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
  // 🔹 Tüm kullanıcıları getir
  async getAllUsers() {
    try {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers();
      if (error) throw error;
      return data.users;
    } catch (error) {
      console.error("Error fetching all users:", error);
      throw error;
    }
  },

  // 🔹 Belirli bir kullanıcıyı getir
  async getUserById(userId) {
    try {
      const { data, error } = await supabaseAdmin.auth.admin.getUserById(
        userId
      );
      if (error) throw error;
      return data.user;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  },

  // 🔹 E-posta bildirimi gönder (Duplicate önleyici kuyruklama)
  async sendEmailNotification(recipients, subject, message) {
    try {
      console.log(`[AdminHelpers] Queueing ${recipients.length} emails...`);

      // Duplicate kontrolü - aynı subject ve recipient için son 5 dakikada email var mı?
      const { data: recentEmails, error: checkError } = await supabaseAdmin
        .from("email_queue")
        .select("recipient, subject")
        .in("recipient", recipients)
        .eq("subject", subject)
        .gte("inserted_at", new Date(Date.now() - 5 * 60 * 1000).toISOString());

      if (checkError) {
        console.warn(
          "[AdminHelpers] Duplicate check failed:",
          checkError.message
        );
      }

      const recentRecipients = new Set(
        recentEmails?.map((e) => e.recipient) || []
      );
      const uniqueRecipients = recipients.filter(
        (recipient) => !recentRecipients.has(recipient)
      );

      if (uniqueRecipients.length === 0) {
        console.log("[AdminHelpers] All emails are duplicates, skipping");
        return [];
      }

      if (uniqueRecipients.length < recipients.length) {
        console.log(
          `[AdminHelpers] Filtered ${
            recipients.length - uniqueRecipients.length
          } duplicate emails`
        );
      }

      // Insert into email queue for processing
      const emailJobs = uniqueRecipients.map((email) => ({
        recipient: email,
        subject,
        template_name: "notification",
        template_data: { message },
        status: "pending",
        attempts: 0,
      }));

      const { data, error } = await supabaseAdmin
        .from("email_queue")
        .insert(emailJobs)
        .select();

      if (error) {
        console.error("[AdminHelpers] Queue insertion error:", error);
        throw error;
      }

      console.log(
        `[AdminHelpers] Successfully queued ${emailJobs.length} unique emails`
      );

      // Email processor'ı doğrudan çağır
      try {
        console.log("[AdminHelpers] Triggering email processor...");

        const processorResponse = await fetch(
          `${supabaseUrl}/functions/v1/email-processor`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${supabaseAnonKey}`,
            },
            body: JSON.stringify({
              trigger: "admin_helper",
              queue_count: emailJobs.length,
            }),
          }
        );

        const processorResult = await processorResponse.json();

        if (processorResponse.ok) {
          console.log(
            "[AdminHelpers] Email processor triggered successfully:",
            processorResult
          );
        } else {
          console.warn("[AdminHelpers] Email processor trigger failed:", {
            status: processorResponse.status,
            result: processorResult,
          });
        }
      } catch (processorError) {
        console.warn(
          "[AdminHelpers] Could not trigger email processor:",
          processorError.message
        );
        console.log(
          "[AdminHelpers] Emails are queued and will be processed later"
        );
      }

      return data;
    } catch (error) {
      console.error("Error queueing emails:", error);
      throw error;
    }
  },
};
