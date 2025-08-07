import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Mail, Send, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/supabase";

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [debugInfo, setDebugInfo] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setDebugInfo("");
    setIsSubmitting(true);

    // Form validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.subject ||
      !formData.message
    ) {
      setError("Please fill in all fields.");
      setIsSubmitting(false);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Please enter a valid email address.");
      setIsSubmitting(false);
      return;
    }

    try {
      // 1. Send notification to the admin team
      const adminNotification = {
        recipient: "info@goformed.co.uk",
        templateName: "contactForm",
        templateData: {
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message.replace(/\n/g, "<br>"),
          timestamp:
            new Date().toLocaleString("en-GB", { timeZone: "Europe/London" }) +
            " GMT",
        },
      };

      console.log("📤 Sending admin notification...");
      const { error: adminError } = await supabase.functions.invoke(
        "send-email",
        {
          body: adminNotification,
        }
      );

      if (adminError) {
        // If admin email fails, it's a critical error.
        console.error("❌ Critical: Admin notification failed:", adminError);
        throw new Error(
          `Failed to send message to our team. Please try again later. Details: ${adminError.message}`
        );
      }
      console.log("✅ Admin notification sent successfully.");

      // 2. Send auto-reply to the customer
      const customerReply = {
        recipient: formData.email,
        templateName: "contactFormReply",
        templateData: {
          name: formData.name,
          subject: formData.subject,
        },
      };

      console.log("📤 Sending customer auto-reply...");
      const { data: replyData, error: replyError } =
        await supabase.functions.invoke("send-email", {
          body: customerReply,
        });

      if (replyError) {
        // This is a non-critical error. The admin has the message, but the user didn't get a confirmation.
        console.warn("⚠️ Customer auto-reply failed:", replyError);

        const technicalDebugInfo = `Customer Email Error: ${JSON.stringify(
          replyError,
          null,
          2
        )}`;
        let userErrorMessage = `Your message has been sent to our team! However, we couldn't send a confirmation email to ${formData.email}. Please check your spam folder.`;

        // Provide a more specific hint if it's a likely deliverability issue.
        const errorMessageString = (replyError.message || "").toLowerCase();
        if (
          errorMessageString.includes("recipient rejected") ||
          errorMessageString.includes("spam") ||
          errorMessageString.includes("policy") ||
          errorMessageString.includes("authentication failed")
        ) {
          userErrorMessage += " This may be due to email provider policies.";
          setDebugInfo(
            technicalDebugInfo +
              "\n\n💡 HINT: The error suggests a deliverability issue. Please ensure your domain's SPF and DKIM DNS records are correctly configured to authorize your SMTP provider. This is crucial for sending to external inboxes like Gmail/Outlook."
          );
        } else {
          setDebugInfo(technicalDebugInfo);
        }

        setError(userErrorMessage);
        // Do not set as submitted, so the user sees the warning.
      } else {
        // Everything was successful!
        console.log("✅ Customer auto-reply sent successfully!");
        setIsSubmitted(true);
        setFormData({ name: "", email: "", subject: "", message: "" });
      }
    } catch (err) {
      console.error("💥 Contact form submission error:", err);
      setError(
        err.message || "An unexpected error occurred. Please try again."
      );
      setDebugInfo(`Full Error Details: ${err.stack || err.toString()}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email Us",
      content: "info@goformed.co.uk",
      href: "mailto:info@goformed.co.uk",
    },
    {
      icon: ({ className }) => (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: "Business Hours",
      content: "Monday - Friday: 9:00 AM - 6:00 PM GMT",
      isStatic: true,
    },
    {
      icon: ({ className }) => (
        <svg
          className={className}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      title: "Response Time",
      content: "We typically respond within 24 hours",
      isStatic: true,
    },
  ];

  return (
    <section
      id="contact"
      className="w-full py-12 sm:py-16 md:py-24 lg:py-32 bg-gradient-to-br from-blue-50 via-white to-purple-50"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
              Get in Touch
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Have questions about forming your UK company? We're here to help
              you every step of the way.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-start">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2 space-y-6"
            >
              {contactInfo.map((item, index) => {
                const IconComponent =
                  typeof item.icon === "function" ? item.icon : item.icon;
                const commonProps = {
                  key: item.title,
                  initial: { opacity: 0, y: 20 },
                  whileInView: { opacity: 1, y: 0 },
                  viewport: { once: true },
                  transition: { duration: 0.4, delay: index * 0.1 },
                  className:
                    "flex items-center gap-4 p-4 sm:p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-gray-100",
                };
                const content = (
                  <>
                    <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base">
                        {item.title}
                      </h4>
                      <p className="text-gray-600 text-sm sm:text-base">
                        {item.content}
                      </p>
                    </div>
                  </>
                );
                return item.isStatic ? (
                  <motion.div {...commonProps}>{content}</motion.div>
                ) : (
                  <motion.a
                    href={item.href}
                    {...commonProps}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className={`${commonProps.className} group`}
                  >
                    {content}
                  </motion.a>
                );
              })}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-3"
            >
              <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">
                    Send us a Message
                  </CardTitle>
                  <CardDescription className="text-base sm:text-lg text-gray-600">
                    Fill out the form below and we'll get back to you within 24
                    hours.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {isSubmitted ? (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center py-8 space-y-4"
                    >
                      <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        Message Sent Successfully!
                      </h3>
                      <p className="text-gray-600">
                        Thank you for reaching out. We've sent a confirmation to
                        your email and will be in touch soon.
                      </p>
                      <Button
                        onClick={() => setIsSubmitted(false)}
                        variant="outline"
                        className="mt-4"
                      >
                        Send Another Message
                      </Button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-4 bg-red-50 border border-red-200 rounded-lg"
                        >
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                            <p className="text-sm text-red-800">{error}</p>
                          </div>
                          {debugInfo && (
                            <details className="mt-2">
                              <summary className="text-xs text-red-600 cursor-pointer font-medium">
                                Show Technical Details
                              </summary>
                              <pre className="text-xs text-red-700 mt-2 p-2 bg-red-100 rounded whitespace-pre-wrap break-words max-h-40 overflow-auto">
                                {debugInfo}
                              </pre>
                            </details>
                          )}
                        </motion.div>
                      )}
                      <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                        <div className="space-y-2">
                          <Label
                            htmlFor="name"
                            className="text-sm font-medium text-gray-700"
                          >
                            Full Name *
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="John Doe"
                            required
                            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="email"
                            className="text-sm font-medium text-gray-700"
                          >
                            Email Address *
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="john@example.com"
                            required
                            className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="subject"
                          className="text-sm font-medium text-gray-700"
                        >
                          Subject *
                        </Label>
                        <Input
                          id="subject"
                          name="subject"
                          value={formData.subject}
                          onChange={handleInputChange}
                          placeholder="How can we help you?"
                          required
                          className="h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="message"
                          className="text-sm font-medium text-gray-700"
                        >
                          Message *
                        </Label>
                        <Textarea
                          id="message"
                          name="message"
                          value={formData.message}
                          onChange={handleInputChange}
                          placeholder="Tell us more..."
                          required
                          rows={5}
                          className="resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-60"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
