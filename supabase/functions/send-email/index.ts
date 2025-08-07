import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

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
    rendered = rendered.replace(regex, String(data[key] || ""));
  }
  return rendered;
};

// --- EMAIL LAYOUT (TABLE-BASED & INLINE CSS FOR COMPATIBILITY) ---
const baseLayout = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{subject}}</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 0; background-color: #f9fafb;">
  <table width="100%" border="0" cellspacing="0" cellpadding="20" style="background-color: #f9fafb;">
    <tr>
      <td align="center" valign="top">
        <table width="600" align="center" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; width: 100%; margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e5e7eb;">
          <!-- Header -->
          <tr>
            <td align="center" style="padding: 20px; border-bottom: 1px solid #e5e7eb; background-color: #ffffff;">
              <h2 style="margin: 0; color: #1f2937;">GoFormed</h2>
            </td>
          </tr>
          <!-- Content -->
          <tr>
            <td style="padding: 30px 20px; background-color: #ffffff;">
              {{content}}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td align="center" style="padding: 20px; font-size: 12px; color: #6b7280; background-color: #f3f4f6;">
              <p style="margin: 0 0 10px 0;">© ${new Date().getFullYear()} GoFormed. All Rights Reserved.</p>
              <p style="margin: 0;">If you did not request this email, please ignore it.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
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
    body: `<h2>{{title}}</h2><div>{{message}}</div>`,
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
    body: `<h1>Password Reset Request</h1><p>Click the button below to reset your password. This link is valid for 1 hour.</p><p><a href="{{reset_link}}" style="background-color: #3b82f6; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: bold;">Reset Password</a></p>`,
  },
  contactForm: {
    subject: "New Contact Form Submission: {{subject}}",
    body: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #2563eb; margin-bottom: 20px;">📧 New Contact Form Submission</h2>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0 0 10px 0;"><strong>👤 Name:</strong> {{name}}</p>
          <p style="margin: 0 0 10px 0;"><strong>📧 Email:</strong> <a href="mailto:{{email}}" style="color: #2563eb;">{{email}}</a></p>
          <p style="margin: 0 0 10px 0;"><strong>📋 Subject:</strong> {{subject}}</p>
        </div>
        <div style="background: white; border: 2px solid #e5e7eb; border-left: 4px solid #2563eb; padding: 20px; border-radius: 8px;">
          <p style="margin: 0 0 10px 0; font-weight: bold;">💬 Message:</p>
          <div style="color: #374151;">{{message}}</div>
        </div>
        <div style="margin-top: 20px; padding: 15px; background: #dbeafe; border-radius: 8px; text-align: center;">
          <p style="margin: 0; color: #1e40af; font-size: 14px;">
            📅 Received: {{timestamp}}<br>
            🌐 Source: GoFormed Contact Form<br>
            💡 Reply directly to this email to respond
          </p>
        </div>
      </div>
    `,
  },
  contactFormReply: {
    subject: "We've Received Your Inquiry | GoFormed",
    body: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset='UTF-8'>
        <title>Your GoFormed Inquiry</title>
      </head>
      <body style='margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4;'>
        <div style='background-color: #ffffff;'>
          <div style='max-width: 600px; margin: 0 auto; padding: 30px; border: 1px solid #eee; border-radius: 8px;'>
            <div style='display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; border-bottom: 1px solid #eee; padding-bottom: 20px;'>
              <img src='http://goformed.co.uk/wp-content/uploads/2022/02/cropped-goforw3.png' alt='GoFormed Logo' style='max-height: 50px; width: auto; margin-bottom: 10px;'>
              <div style='text-align: right; font-size: 13px; color: #555;'>
                Emma Richardson<br>
                <strong style='color: #0A0F28;'>Senior Company Expert</strong><br>
                GoFormed
              </div>
            </div>
            <h2 style='color: #0A0F28; margin-top: 30px;'>Thank you for reaching out, {{name}}!</h2>
            <p style='margin-bottom: 20px; font-size: 16px; line-height: 1.6;'>We've successfully received your message and will get back to you as soon as possible, typically within one business day.</p>
            <div style='padding: 20px; background-color: #f9f5ed; border-left: 4px solid #C19A61; margin-bottom: 25px;'>
              <p style='margin: 0; font-size: 15px; line-height: 1.6;'><strong>Your Partner in UK Business:</strong> While you wait for our personal reply, here's a reminder of how we help entrepreneurs like you establish, grow, and succeed in the UK.</p>
            </div>
            <h3 style='color: #C19A61;'>Our Core Services:</h3>
            <ul style='padding-left: 0; font-size: 15px; list-style: none; margin: 0;'>
              <li style='margin-bottom: 15px; padding-left: 10px;'><strong>Company Formation:</strong> Fast, compliant, and hassle-free registration.</li>
              <li style='margin-bottom: 15px; padding-left: 10px;'><strong>Ready-Made Companies:</strong> Start trading instantly with a pre-registered UK company.</li>
              <li style='margin-bottom: 15px; padding-left: 10px;'><strong>Banking Assistance:</strong> Unlock access to UK banking and payment gateways like Stripe.</li>
            </ul>
            <p style='font-size: 16px; line-height: 1.6; margin-top: 30px;'>We are committed to providing you with expert guidance and streamlined solutions. We look forward to speaking with you soon.</p>
            <hr style='margin: 30px 0; border: none; border-top: 1px solid #eee;'>
            <p style='font-size: 13px; color: #777; text-align: center;'>GO&PARTNERS UK LIMITED | Company No. 16508115<br>2nd Floor College House, 17 King Edwards Road, Ruislip, London, United Kingdom, HA4 7AE</p>
          </div>
        </div>
      </body>
      </html>
    `,
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
  // Pass subject to baseLayout so it can be used in the <title> tag
  const subjectData = { ...data, subject: subject, content: content };
  const finalHtml = renderTemplate(baseLayout, subjectData);

  return { subject, html: finalHtml };
};

// --- QUOTED-PRINTABLE ENCODING FUNCTION ---
function quotedPrintableEncode(str: string): string {
  return str
    .replace(/[\x00-\x1F=\x7F-\xFF]/g, (c) => {
      return "=" + c.charCodeAt(0).toString(16).toUpperCase().padStart(2, "0");
    })
    .replace(/ $/gm, "=20") // Satır sonundaki boşluklar
    .replace(/(.{75})/g, "$1=\r\n"); // 75 karakter sonra satır kesme
}

// --- MODERN SMTP FUNCTION ---
async function sendEmailViaSMTP(
  to: string,
  subject: string,
  htmlContent: string,
  textContent: string,
  replyTo?: string
) {
  console.log(`Attempting to send email to: ${to}`);

  const boundary = `boundary_${Date.now()}_${Math.random().toString(36)}`;
  const date = new Date().toUTCString();

  // Encode content using quoted-printable
  const encodedTextContent = quotedPrintableEncode(textContent);
  const encodedHtmlContent = quotedPrintableEncode(htmlContent);

  const emailContent = [
    `From: ${SMTP_FROM}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    `Date: ${date}`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    replyTo ? `Reply-To: ${replyTo}` : null,
    ``,
    `--${boundary}`,
    `Content-Type: text/plain; charset=utf-8`,
    `Content-Transfer-Encoding: quoted-printable`,
    ``,
    encodedTextContent,
    ``,
    `--${boundary}`,
    `Content-Type: text/html; charset=utf-8`,
    `Content-Transfer-Encoding: quoted-printable`,
    ``,
    encodedHtmlContent,
    ``,
    `--${boundary}--`,
  ]
    .filter(Boolean)
    .join("\r\n");

  console.log(`Connecting to ${SMTP_HOST}:${SMTP_PORT}`);

  let conn: Deno.TcpConn | Deno.TlsConn | null = null;

  try {
    conn = await Deno.connectTls({
      hostname: SMTP_HOST!,
      port: parseInt(SMTP_PORT!),
    });

    console.log("TLS connection established");

    const readResponse = async (): Promise<string> => {
      const buffer = new Uint8Array(1024);
      const n = await conn!.read(buffer);
      if (n === null) throw new Error("Connection closed unexpectedly");
      return new TextDecoder().decode(buffer.subarray(0, n));
    };

    const sendCommand = async (command: string): Promise<string> => {
      console.log(`> ${command}`);
      await conn!.write(new TextEncoder().encode(command + "\r\n"));
      const response = await readResponse();
      console.log(`< ${response.trim()}`);
      return response;
    };

    let response = await readResponse();
    console.log(`< ${response.trim()}`);

    if (!response.startsWith("220")) {
      throw new Error(`SMTP server error: ${response}`);
    }

    response = await sendCommand(`EHLO ${SMTP_HOST}`);
    if (!response.startsWith("250")) {
      throw new Error(`EHLO failed: ${response}`);
    }

    response = await sendCommand("AUTH LOGIN");
    if (!response.startsWith("334")) {
      throw new Error(`AUTH LOGIN failed: ${response}`);
    }

    const username = btoa(SMTP_USER!);
    response = await sendCommand(username);
    if (!response.startsWith("334")) {
      throw new Error(`Username authentication failed: ${response}`);
    }

    const password = btoa(SMTP_PASS!);
    response = await sendCommand(password);
    if (!response.startsWith("235")) {
      throw new Error(`Password authentication failed: ${response}`);
    }

    console.log("SMTP authentication successful");

    response = await sendCommand(`MAIL FROM:<${SMTP_FROM}>`);
    if (!response.startsWith("250")) {
      throw new Error(`MAIL FROM failed: ${response}`);
    }

    response = await sendCommand(`RCPT TO:<${to}>`);
    if (!response.startsWith("250")) {
      throw new Error(`RCPT TO failed: ${response}`);
    }

    response = await sendCommand("DATA");
    if (!response.startsWith("354")) {
      throw new Error(`DATA command failed: ${response}`);
    }

    await conn.write(new TextEncoder().encode(emailContent + "\r\n.\r\n"));
    response = await readResponse();
    console.log(`< ${response.trim()}`);

    if (!response.startsWith("250")) {
      throw new Error(`Email sending failed: ${response}`);
    }

    await sendCommand("QUIT");
    console.log("Email sent successfully!");

    return "Email sent successfully";
  } catch (error) {
    console.error("SMTP Error:", error);
    throw error;
  } finally {
    if (conn) {
      try {
        conn.close();
      } catch (e) {
        console.error("Error closing connection:", e);
      }
    }
  }
}

// --- MAIN FUNCTION ---
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !SMTP_FROM) {
      const missingVars = [];
      if (!SMTP_HOST) missingVars.push("SMTP_HOST");
      if (!SMTP_PORT) missingVars.push("SMTP_PORT");
      if (!SMTP_USER) missingVars.push("SMTP_USER");
      if (!SMTP_PASS) missingVars.push("SMTP_PASS");
      if (!SMTP_FROM) missingVars.push("SMTP_FROM");

      throw new Error(
        `Email service configuration error. Missing: ${missingVars.join(", ")}`
      );
    }

    const body = await req.json();
    const {
      recipient,
      templateName,
      templateData = {},
      subject: customSubject,
    } = body;

    if (!recipient || !templateName) {
      throw new Error("Both `recipient` and `templateName` are required.");
    }

    console.log(`Processing email: ${templateName} template to ${recipient}`);

    const { subject, html } = getEmailContent(templateName, templateData);

    const plainText = html
      .replace(/<style[^>]*>.*?<\/style>/gs, "")
      .replace(/<[^>]*>/g, "")
      .replace(/\s+/g, " ")
      .trim();

    const finalSubject = customSubject || subject;
    const replyTo = templateData.email || undefined;

    await sendEmailViaSMTP(recipient, finalSubject, html, plainText, replyTo);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email sent successfully",
        recipient: recipient,
        subject: finalSubject,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Email function error:", error);

    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";

    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
