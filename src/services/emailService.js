// src/services/emailService.js
import { supabase } from "@/supabase";

export const sendEmail = async ({
  recipient,
  templateName,
  templateData = {},
  subject,
}) => {
  try {
    const { data, error: invokeError } = await supabase.functions.invoke(
      "send-email",
      {
        body: {
          recipient,
          templateName,
          templateData,
          subject,
        },
      }
    );

    if (invokeError) {
      throw new Error(invokeError.message);
    }

    if (data.error) {
      throw new Error(data.error);
    }

    console.log("Email sent successfully. Message ID:", data.messageId);
    return { success: true, data };
  } catch (error) {
    console.error("Error sending email:", error.message);
    return { success: false, error: error.message };
  }
};
