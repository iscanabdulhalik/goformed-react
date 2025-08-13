// src/components/sections/ContactSection.jsx - MOBILE-FIRST RESPONSIVE
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
        console.warn("⚠️ Customer auto-reply failed:", replyError);

        const technicalDebugInfo = `Customer Email Error: ${JSON.stringify(
          replyError,
          null,
          2
        )}`;
        let userErrorMessage = `Your message has been sent to our team! However, we couldn't send a confirmation email to ${formData.email}. Please check your spam folder.`;

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
      } else {
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
      className="w-full py-12 sm:py-16 md:py-20 lg:py-24 xl:py-32 bg-gradient-to-br from-blue-50 via-white to-purple-50"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-12 lg:mb-16"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 lg:mb-6 px-4">
              Get in Touch
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
              Have questions about forming your UK company? We're here to help
              you every step of the way.
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-5 gap-6 sm:gap-8 lg:gap-12 items-start">
            {/* Contact Info - Mobile first */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2 space-y-4 sm:space-y-6 order-2 lg:order-1"
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
                    "flex items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-white/80 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-sm border border-gray-100",
                };
                const content = (
                  <>
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                      <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-gray-900 text-sm sm:text-base mb-1">
                        {item.title}
                      </h4>
                      <p className="text-gray-600 text-xs sm:text-sm lg:text-base break-words">
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
                    className={`${commonProps.className} group cursor-pointer`}
                  >
                    {content}
                  </motion.a>
                );
              })}
            </motion.div>

            {/* Contact Form - Mobile optimized */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-3 order-1 lg:order-2"
            >
              <Card className="shadow-xl sm:shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="text-center pb-4 sm:pb-6 p-4 sm:p-6">
                  <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                    Send us a Message
                  </CardTitle>
                  <CardDescription className="text-sm sm:text-base lg:text-lg text-gray-600 mt-2">
                    Fill out the form below and we'll get back to you within 24
                    hours.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
                  {isSubmitted ? (
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="text-center py-6 sm:py-8 space-y-3 sm:space-y-4"
                    >
                      <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
                      </div>
                      <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                        Message Sent Successfully!
                      </h3>
                      <p className="text-sm sm:text-base text-gray-600 px-4">
                        Thank you for reaching out. We've sent a confirmation to
                        your email and will be in touch soon.
                      </p>
                      <Button
                        onClick={() => setIsSubmitted(false)}
                        variant="outline"
                        className="mt-3 sm:mt-4"
                      >
                        Send Another Message
                      </Button>
                    </motion.div>
                  ) : (
                    <form
                      onSubmit={handleSubmit}
                      className="space-y-4 sm:space-y-6"
                    >
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg"
                        >
                          <div className="flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs sm:text-sm text-red-800">
                              {error}
                            </p>
                          </div>
                          {debugInfo && (
                            <details className="mt-2">
                              <summary className="text-xs text-red-600 cursor-pointer font-medium">
                                Show Technical Details
                              </summary>
                              <pre className="text-xs text-red-700 mt-2 p-2 bg-red-100 rounded whitespace-pre-wrap break-words max-h-32 sm:max-h-40 overflow-auto">
                                {debugInfo}
                              </pre>
                            </details>
                          )}
                        </motion.div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
                            className="h-10 sm:h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
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
                            className="h-10 sm:h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
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
                          className="h-10 sm:h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
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
                          rows={4}
                          className="resize-none border-gray-200 focus:border-blue-500 focus:ring-blue-500 text-sm sm:text-base"
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full h-10 sm:h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg sm:rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-60 text-sm sm:text-base"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
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
