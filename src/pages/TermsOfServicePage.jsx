// src/pages/TermsOfServicePage.jsx
import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button asChild variant="ghost" className="mb-4">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              Terms of Service
            </h1>
          </div>
          <p className="text-gray-600">
            Last updated: {new Date().toLocaleDateString("en-GB")}
          </p>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg shadow-sm p-8 space-y-8"
        >
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Agreement to Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms of Service ("Terms") govern your use of GoFormed's
              website and services. By accessing or using our services, you
              agree to be bound by these Terms. If you disagree with any part of
              these Terms, you may not access our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              GoFormed provides UK company formation and related business
              services, including:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>UK Limited Company registration</li>
              <li>Registered office address services</li>
              <li>Business banking assistance</li>
              <li>Corporate compliance support</li>
              <li>Virtual office services</li>
              <li>Business growth consultation</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              User Responsibilities
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              When using our services, you agree to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Comply with all applicable laws and regulations</li>
              <li>Not use our services for illegal purposes</li>
              <li>Maintain the confidentiality of your account</li>
              <li>Pay all applicable fees in a timely manner</li>
              <li>Notify us of any changes to your information</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Fees and Payment
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                Our service fees are clearly outlined on our website. Payment is
                required before we begin processing your company formation
                request.
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>All fees are quoted in British Pounds (£)</li>
                <li>Government filing fees are separate and additional</li>
                <li>Refunds are subject to our refund policy</li>
                <li>Late payments may incur additional charges</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Service Limitations
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              While we strive to provide excellent service, please note:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2">
              <li>We cannot guarantee acceptance by Companies House</li>
              <li>Processing times may vary due to external factors</li>
              <li>
                Third-party services (banking, etc.) are subject to their own
                terms
              </li>
              <li>
                We are not responsible for changes in government regulations
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Intellectual Property
            </h2>
            <p className="text-gray-700 leading-relaxed">
              All content on our website, including text, graphics, logos, and
              software, is owned by GoFormed or our licensors and protected by
              intellectual property laws. You may not use our content without
              explicit permission.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Limitation of Liability
            </h2>
            <p className="text-gray-700 leading-relaxed">
              To the maximum extent permitted by law, GoFormed shall not be
              liable for any indirect, incidental, special, or consequential
              damages arising from your use of our services. Our total liability
              is limited to the amount paid for our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Termination
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may terminate or suspend your access to our services
              immediately, without prior notice, for conduct that we believe
              violates these Terms or is harmful to other users, us, or third
              parties.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Changes to Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will
              notify users of any material changes by posting the new Terms on
              our website. Your continued use of our services constitutes
              acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Governing Law
            </h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms are governed by and construed in accordance with the
              laws of England and Wales. Any disputes shall be subject to the
              exclusive jurisdiction of the courts of England and Wales.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Contact Information
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have questions about these Terms of Service, please contact
              us:
            </p>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-600" />
                <span className="text-gray-700">info@goformed.co.uk</span>
              </div>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
