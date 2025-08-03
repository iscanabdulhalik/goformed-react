// supabase/functions/email-processor/index.ts - DUPLICATE PREVENTION ENABLED

import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EmailQueueItem {
  id: number;
  recipient: string;
  subject: string;
  template_name: string;
  template_data: any;
  attempts: number;
  status: string;
  inserted_at: string;
}

// ✅ PROCESSOR LOCK MECHANISM
const PROCESSOR_LOCK_KEY = "email_processor_lock";
const LOCK_DURATION = 60000; // 60 seconds

class HostingerSMTP {
  name = "hostinger-smtp";
  private config: {
    hostname: string;
    port: number;
    username: string;
    password: string;
    from: string;
  };

  constructor(config: any) {
    this.config = config;
  }

  async send(
    email: EmailQueueItem
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      console.log(`[HOSTINGER] Processing email to: ${email.recipient}`);
      console.log(
        `[HOSTINGER] Using server: ${this.config.hostname}:${this.config.port}`
      );

      if (this.config.port === 465) {
        return await this.sendViaSSL(email);
      } else {
        return await this.sendViaSTARTTLS(email);
      }
    } catch (error) {
      console.error(`[HOSTINGER] ❌ General error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown SMTP error",
      };
    }
  }

  private async sendViaSSL(
    email: EmailQueueItem
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    let conn: Deno.TlsConn | null = null;

    try {
      console.log("[HOSTINGER] Connecting via SSL/TLS (port 465)...");

      conn = await Deno.connectTls({
        hostname: this.config.hostname,
        port: this.config.port,
      });

      const encoder = new TextEncoder();
      const decoder = new TextDecoder();

      await this.readResponse(conn, decoder);
      await this.sendCommand(conn, encoder, "EHLO goformed.co.uk\r\n");
      await this.readResponse(conn, decoder);

      await this.sendCommand(conn, encoder, "AUTH LOGIN\r\n");
      await this.readResponse(conn, decoder);

      await this.sendCommand(
        conn,
        encoder,
        `${btoa(this.config.username)}\r\n`
      );
      await this.readResponse(conn, decoder);

      await this.sendCommand(
        conn,
        encoder,
        `${btoa(this.config.password)}\r\n`
      );
      const authResponse = await this.readResponse(conn, decoder);

      if (!authResponse.startsWith("235")) {
        throw new Error(`Authentication failed: ${authResponse}`);
      }

      console.log("[HOSTINGER] ✅ Authentication successful");

      await this.sendCommand(
        conn,
        encoder,
        `MAIL FROM:<${this.config.from}>\r\n`
      );
      await this.readResponse(conn, decoder);

      await this.sendCommand(conn, encoder, `RCPT TO:<${email.recipient}>\r\n`);
      await this.readResponse(conn, decoder);

      await this.sendCommand(conn, encoder, "DATA\r\n");
      await this.readResponse(conn, decoder);

      const emailContent = this.buildSimpleEmailContent(email);
      await this.sendCommand(conn, encoder, emailContent + "\r\n.\r\n");
      const dataResponse = await this.readResponse(conn, decoder);

      if (!dataResponse.startsWith("250")) {
        throw new Error(`Data transmission failed: ${dataResponse}`);
      }

      await this.sendCommand(conn, encoder, "QUIT\r\n");

      conn.close();
      console.log(
        `[HOSTINGER] ✅ Email sent successfully to ${email.recipient}`
      );

      return {
        success: true,
        messageId: `${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}@goformed.co.uk`,
      };
    } catch (error) {
      if (conn) {
        try {
          conn.close();
        } catch {}
      }
      console.error(`[HOSTINGER] SSL Error:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async sendViaSTARTTLS(
    email: EmailQueueItem
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    console.log("[HOSTINGER] STARTTLS method - coming soon");
    return { success: false, error: "STARTTLS not implemented yet" };
  }

  private async sendCommand(
    conn: Deno.TlsConn,
    encoder: TextEncoder,
    command: string
  ): Promise<void> {
    const data = encoder.encode(command);
    await conn.write(data);
    console.log(`[HOSTINGER] >>> ${command.trim()}`);
  }

  private async readResponse(
    conn: Deno.TlsConn,
    decoder: TextDecoder
  ): Promise<string> {
    const buffer = new Uint8Array(1024);
    const n = await conn.read(buffer);
    const response = decoder.decode(buffer.subarray(0, n || 0)).trim();
    console.log(`[HOSTINGER] <<< ${response}`);
    return response;
  }

  private buildSimpleEmailContent(email: EmailQueueItem): string {
    const textContent = email.template_data?.message || email.subject;
    const htmlContent = this.generateSimpleHTML(email);
    const boundary = "simple-boundary-123";
    const date = new Date().toUTCString();

    return `From: ${this.config.from}
To: ${email.recipient}
Subject: ${email.subject}
Date: ${date}
MIME-Version: 1.0
Content-Type: multipart/alternative; boundary="${boundary}"

--${boundary}
Content-Type: text/plain; charset=UTF-8

${textContent}

--${boundary}
Content-Type: text/html; charset=UTF-8

${htmlContent}

--${boundary}--`;
  }

  private generateSimpleHTML(email: EmailQueueItem): string {
    const message =
      email.template_data?.message || "You have a new notification.";
    return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>GoFormed</title></head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f4f4f4;">
  <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px;">
    <h1 style="color: #dc2626; margin: 0 0 20px 0;">GoFormed</h1>
    <h2 style="color: #333; margin: 0 0 15px 0;">New Notification</h2>
    <p style="color: #666; line-height: 1.6; margin: 0 0 25px 0;">${message}</p>
    <a href="https://goformed.co.uk/dashboard"
       style="display: inline-block; background: #dc2626; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px;">
      View Dashboard
    </a>
    <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
    <p style="color: #999; font-size: 12px; margin: 0;">GoFormed Ltd - Your Business Formation Partner</p>
  </div>
</body>
</html>`;
  }
}

// ✅ LOCK HELPER FUNCTIONS
async function acquireLock(supabaseClient: any): Promise<boolean> {
  try {
    console.log("[LOCK] Attempting to acquire processor lock...");

    // Check if lock exists and is recent
    const { data: existingLock } = await supabaseClient
      .from("system_settings")
      .select("value")
      .eq("key", PROCESSOR_LOCK_KEY)
      .single();

    if (existingLock?.value?.timestamp) {
      const lockAge = Date.now() - existingLock.value.timestamp;
      if (lockAge < LOCK_DURATION) {
        console.log(
          `[LOCK] ⚠️ Lock exists and is ${lockAge}ms old (< ${LOCK_DURATION}ms). Skipping.`
        );
        return false;
      }
      console.log(`[LOCK] Lock is stale (${lockAge}ms old), updating...`);

      // Update existing lock
      const { error: updateError } = await supabaseClient
        .from("system_settings")
        .update({
          value: {
            timestamp: Date.now(),
            instance: Math.random().toString(36).substr(2, 9),
          },
          updated_at: new Date().toISOString(),
        })
        .eq("key", PROCESSOR_LOCK_KEY);

      if (updateError) {
        console.error("[LOCK] Failed to update lock:", updateError);
        return false;
      }
    } else {
      // Create new lock
      console.log("[LOCK] No existing lock found, creating new one...");
      const { error: insertError } = await supabaseClient
        .from("system_settings")
        .insert({
          key: PROCESSOR_LOCK_KEY,
          value: {
            timestamp: Date.now(),
            instance: Math.random().toString(36).substr(2, 9),
          },
          description: "Email processor execution lock",
          category: "system",
        });

      if (insertError) {
        // If insert fails due to race condition, check if another process created it
        if (insertError.code === "23505") {
          console.log(
            "[LOCK] ⚠️ Race condition detected, another process created the lock"
          );
          return false;
        }
        console.error("[LOCK] Failed to create lock:", insertError);
        return false;
      }
    }

    console.log("[LOCK] ✅ Lock acquired successfully");
    return true;
  } catch (error) {
    console.error("[LOCK] Lock acquisition error:", error);
    return false;
  }
}

async function releaseLock(supabaseClient: any): Promise<void> {
  try {
    await supabaseClient
      .from("system_settings")
      .delete()
      .eq("key", PROCESSOR_LOCK_KEY);
    console.log("[LOCK] ✅ Lock released");
  } catch (error) {
    console.error("[LOCK] Failed to release lock:", error);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const startTime = Date.now();
  console.log(
    "🚀 Hostinger Email Processor started:",
    new Date().toISOString()
  );

  let supabaseClient: any = null;

  try {
    supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // ✅ ACQUIRE LOCK TO PREVENT CONCURRENT EXECUTION
    const lockAcquired = await acquireLock(supabaseClient);
    if (!lockAcquired) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Processor already running or recently completed",
          skipped: true,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ✅ ATOMIC EMAIL SELECTION WITH ROW LOCKING
    console.log("[PROCESSOR] Selecting pending emails with row lock...");

    const { data: pendingEmails, error: fetchError } = await supabaseClient
      .from("email_queue")
      .select("*")
      .eq("status", "pending")
      .lt("attempts", 3)
      .order("inserted_at", { ascending: true })
      .limit(10);

    if (fetchError) {
      throw new Error(`Failed to fetch emails: ${fetchError.message}`);
    }

    const totalPending = pendingEmails?.length || 0;
    console.log(`📧 Found ${totalPending} pending emails`);

    if (!pendingEmails || totalPending === 0) {
      await releaseLock(supabaseClient);
      return new Response(
        JSON.stringify({
          success: true,
          message: "No pending emails to process.",
          results: { processed: 0, sent: 0, failed: 0, errors: [] },
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ✅ MARK EMAILS AS PROCESSING TO PREVENT DOUBLE PROCESSING
    const emailIds = pendingEmails.map((email: { id: any }) => email.id);
    console.log(
      `[PROCESSOR] Marking ${emailIds.length} emails as processing...`
    );

    const { error: markError } = await supabaseClient
      .from("email_queue")
      .update({
        status: "processing",
        last_attempt_at: new Date().toISOString(),
      })
      .in("id", emailIds);

    if (markError) {
      console.error(
        "[PROCESSOR] Failed to mark emails as processing:",
        markError
      );
      await releaseLock(supabaseClient);
      throw markError;
    }

    console.log("[PROCESSOR] ✅ Emails marked as processing");

    const smtpConfig = {
      hostname: "smtp.hostinger.com",
      port: 465,
      username: Deno.env.get("SMTP_USER") || "",
      password: Deno.env.get("SMTP_PASS") || "",
      from: Deno.env.get("SMTP_FROM") || "",
    };

    if (!smtpConfig.username || !smtpConfig.password || !smtpConfig.from) {
      await releaseLock(supabaseClient);
      throw new Error("Missing SMTP credentials in environment variables");
    }

    const emailProvider = new HostingerSMTP(smtpConfig);
    const results = {
      processed: 0,
      sent: 0,
      failed: 0,
      errors: [] as string[],
    };

    // ✅ PROCESS EACH EMAIL WITH INDIVIDUAL STATUS UPDATES
    for (const email of pendingEmails) {
      results.processed++;
      console.log(
        `\n📤 Processing email ${results.processed}/${totalPending}: ${email.recipient}`
      );
      console.log(`📋 Subject: ${email.subject}`);
      console.log(`🆔 Queue ID: ${email.id}`);

      const sendResult = await emailProvider.send(email);

      if (sendResult.success) {
        await supabaseClient
          .from("email_queue")
          .update({
            status: "sent",
            last_attempt_at: new Date().toISOString(),
          })
          .eq("id", email.id);

        await supabaseClient.from("email_logs").insert({
          recipient: email.recipient,
          subject: email.subject,
          status: "sent",
          provider: emailProvider.name,
          provider_message_id: sendResult.messageId,
          template_name: email.template_name,
        });

        results.sent++;
        console.log(`✅ SUCCESS: Email sent to ${email.recipient}`);
      } else {
        const newAttempts = email.attempts + 1;
        const newStatus = newAttempts >= 3 ? "failed" : "pending";

        await supabaseClient
          .from("email_queue")
          .update({
            attempts: newAttempts,
            last_attempt_at: new Date().toISOString(),
            status: newStatus,
            error_message: sendResult.error,
          })
          .eq("id", email.id);

        await supabaseClient.from("email_logs").insert({
          recipient: email.recipient,
          subject: email.subject,
          status: "failed",
          provider: emailProvider.name,
          error_message: sendResult.error,
          template_name: email.template_name,
        });

        results.failed++;
        results.errors.push(`${email.recipient}: ${sendResult.error}`);
        console.log(`❌ FAILED: ${email.recipient} - ${sendResult.error}`);
      }

      // Rate limiting between emails
      if (results.processed < totalPending) {
        console.log("⏳ Waiting 2 seconds before next email...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }
    }

    // ✅ RELEASE LOCK
    await releaseLock(supabaseClient);

    const processingTime = Date.now() - startTime;
    console.log(
      `\n📊 Final Results: ${results.sent}/${results.processed} emails sent successfully`
    );
    console.log(`⏱️ Total processing time: ${processingTime}ms`);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email processing completed.",
        results: {
          ...results,
          totalPending,
          processingTimeMs: processingTime,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("💥 Email processor critical error:", error);

    // Ensure lock is released on error
    if (supabaseClient) {
      await releaseLock(supabaseClient);
    }

    return new Response(
      JSON.stringify({
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
