// supabase/functions/send-email/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { SmtpClient } from "https://deno.land/x/smtp@v0.7.0/mod.ts";

// --- SMTP CONFIGURATION ---
const SMTP_HOST = Deno.env.get("SMTP_HOST");
const SMTP_PORT = Deno.env.get("SMTP_PORT");
const SMTP_USER = Deno.env.get("SMTP_USER");
const SMTP_PASS = Deno.env.get("SMTP_PASS");
const SMTP_FROM = Deno.env.get("SMTP_FROM");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// --- TEMPLATING SYSTEM ---
interface TemplateData {
  [key: string]: any;
}

const renderTemplate = (template: string, data: TemplateData): string => {
  let rendered = template;
  for (const key in data) {
    const regex = new RegExp(`{{${key}}}`, "g");
    rendered = rendered.replace(regex, data[key]);
  }
  return rendered;
};

const baseLayout = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'; color: #333; line-height: 1.6; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb; }
    .header { padding: 20px; text-align: center; border-bottom: 1px solid #e5e7eb; background-color: #ffffff; }
    .content { padding: 30px 20px; background-color: #ffffff; }
    .footer { padding: 20px; text-align: center; font-size: 12px; color: #6b7280; }
    a { color: #3b82f6; text-decoration: none; }
    .button { background-color: #3b82f6; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 8px; display: inline-block; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="https://goformed.co.uk/wp-content/uploads/2024/04/goformed-logo-1.png" alt="GoFormed" style="height: 32px;" />
    </div>
    <div class="content">
      {{{content}}}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} GoFormed. All Rights Reserved.</p>
      <p>If you did not request this email, please ignore it.</p>
    </div>
  </div>
</body>
</html>
`;

const templates = {
  welcome: {
    subject: "Welcome to GoFormed!",
    body: `<h1>Hi {{name}},</h1><p>Welcome to GoFormed! We're excited to have you on board and help you launch your UK business.</p>`,
  },
  notification: {
    subject: "{{subject}}",
    body: `<h2>{{title}}</h2><p>{{message}}</p>`,
  },
  statusUpdate: {
    subject: "Update on your company: {{company_name}}",
    body: `<h1>Status Update</h1><p>Hi {{name}},</p><p>The status of your company request for <strong>{{company_name}}</strong> has been updated to: <strong>{{status}}</strong>.</p><p>You can view the full details in your dashboard.</p>`,
  },
  paymentConfirmation: {
    subject: "Payment Received for {{order_name}}",
    body: `<h1>Thank you for your payment!</h1><p>We've successfully received your payment of <strong>£{{amount}}</strong> for order <strong>{{order_name}}</strong>.</p><p>Our team will begin processing it shortly.</p>`,
  },
  passwordReset: {
    subject: "Reset your GoFormed password",
    body: `<h1>Password Reset Request</h1><p>Click the button below to reset your password. This link is valid for 1 hour.</p><p><a href="{{reset_link}}" class="button">Reset Password</a></p>`,
  },
};

const getEmailContent = (
  templateName: keyof typeof templates,
  data: TemplateData
): { subject: string; html: string } => {
  const template = templates[templateName];
  if (!template) {
    throw new Error(`Template "${templateName}" not found.`);
  }
  const content = renderTemplate(template.body, data);
  const subject = renderTemplate(template.subject, data);
  const html = baseLayout.replace("{{{content}}}", content);
  return { subject, html };
};

// --- MAIN FUNCTION ---

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const client = new SmtpClient();

  try {
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
      console.error("Missing SMTP environment variables.");
      throw new Error(
        "Email service is not configured correctly on the server."
      );
    }

    const {
      recipient,
      templateName,
      templateData = {},
      subject: customSubject,
    } = await req.json();

    if (!recipient || !templateName) {
      throw new Error("`recipient` and `templateName` are required.");
    }

    const { subject, html } = getEmailContent(templateName, templateData);

    // Connect to Hostinger SMTP server
    await client.connectTLS({
      hostname: SMTP_HOST,
      port: Number(SMTP_PORT),
      username: SMTP_USER,
      password: SMTP_PASS,
    });

    // Send the email
    await client.send({
      from: SMTP_FROM,
      to: recipient,
      subject: customSubject || subject,
      content: html.replace(/<[^>]*>/g, ""), // Strip HTML tags for plain text content
      html: html,
    });

    await client.close();

    return new Response(
      JSON.stringify({ success: true, message: "Email sent via SMTP." }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    if (client) {
      await client.close();
    }
    if (error instanceof Error) {
      console.error("Email function error:", error.message);
    } else {
      console.error("Email function error:", error);
    }
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error ? error.message : "An unknown error occurred",
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
