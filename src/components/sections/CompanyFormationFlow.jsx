// src/components/sections/CompanyFormationFlow.jsx - Real API ile
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Check,
  Search,
  Loader2,
  PartyPopper,
  ShieldCheck,
  FileSignature,
  AlertTriangle,
} from "lucide-react";

import { ukPackages, globalPackages } from "@/lib/packages";

const CompanyStatus = {
  IDLE: "idle",
  LOADING: "loading",
  AVAILABLE: "available",
  UNAVAILABLE: "unavailable",
  ERROR: "error",
  INVALID: "invalid",
};

export default function CompanyFormationFlow() {
  const [activeTab, setActiveTab] = useState("uk");
  const [step, setStep] = useState(1);
  const [companyName, setCompanyName] = useState("");
  const [companyStatus, setCompanyStatus] = useState(CompanyStatus.IDLE);
  const [acceptedName, setAcceptedName] = useState("");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [userDetails, setUserDetails] = useState({ fullName: "", email: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [packageError, setPackageError] = useState(false);
  const detailsFormRef = useRef(null);

  const handleSelectPackage = (pkg) => {
    if (!acceptedName) {
      setPackageError(true);
      const inputElement = document.querySelector('input[type="text"]');
      inputElement?.focus();
      return;
    }
    setSelectedPackage(pkg);
    setStep(2);
  };

  useEffect(() => {
    setAcceptedName("");
    setCompanyStatus(CompanyStatus.IDLE);
    setPackageError(false);
  }, [companyName]);

  const handleCompanySearch = async () => {
    const name = companyName.toUpperCase().trim();
    if (!name.endsWith("LTD") && !name.endsWith("LIMITED")) {
      setCompanyStatus(CompanyStatus.INVALID);
      return;
    }

    setCompanyStatus(CompanyStatus.LOADING);

    try {
      console.log("Searching for company:", name);

      // ✅ GÜVENLİ: API key artık server-side'da
      const { data, error } = await supabase.functions.invoke(
        "check-company-name-secure",
        {
          body: { companyName: name },
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (error) {
        console.error("Function error:", error);
        throw error;
      }

      console.log("Companies House response:", data);

      // Tam eşleşme kontrolü
      const exactMatch = data.items?.find(
        (item) => item.title.toUpperCase().trim() === name
      );

      if (exactMatch) {
        setCompanyStatus(CompanyStatus.UNAVAILABLE);
      } else {
        setCompanyStatus(CompanyStatus.AVAILABLE);
        setAcceptedName(name);
        setPackageError(false);
        setTimeout(() => {
          const pricingElement = document.getElementById("packages");
          pricingElement?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 100);
      }
    } catch (error) {
      console.error("Company search error:", error);
      setCompanyStatus(CompanyStatus.ERROR);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!userDetails.fullName || !userDetails.email) {
      setFormError("Please enter both your full name and email address.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userDetails.email)) {
      setFormError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        // Magic link gönder
        const { error: authError } = await supabase.auth.signInWithOtp({
          email: userDetails.email,
          options: {
            data: {
              full_name: userDetails.fullName,
            },
          },
        });

        if (authError) throw authError;

        // Pending request'i localStorage'a kaydet
        localStorage.setItem(
          "pendingRequest",
          JSON.stringify({
            fullName: userDetails.fullName,
            email: userDetails.email,
            companyName: acceptedName,
            packageName: selectedPackage.name,
            selectedPackage: selectedPackage,
          })
        );

        setStep(3);
        return;
      }

      // Duplikasyon kontrolü
      const { data: existingRequests } = await supabase
        .from("company_requests")
        .select("id")
        .eq("user_id", user.id)
        .eq("company_name", acceptedName);

      if (existingRequests && existingRequests.length > 0) {
        setFormError("You already have a request for this company name.");
        setIsSubmitting(false);
        return;
      }

      // Request oluştur
      const { error } = await supabase.from("company_requests").insert({
        user_id: user.id,
        company_name: acceptedName,
        package_name: selectedPackage.name,
        user_details: {
          fullName: userDetails.fullName,
          email: userDetails.email,
        },
      });

      if (error) throw error;

      setStep(3);
      window.scrollTo({
        top: detailsFormRef.current?.offsetTop - 150 || 0,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("Form submission error:", error);
      setFormError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderCompanyStatus = () => {
    const name = companyName.toUpperCase().trim();
    switch (companyStatus) {
      case CompanyStatus.LOADING:
        return (
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <Loader2 className="animate-spin h-4 w-4" />
            Checking with Companies House...
          </div>
        );
      case CompanyStatus.AVAILABLE:
        return (
          <div className="flex items-center justify-center gap-2 font-semibold text-green-600">
            <Check className="h-5 w-5" />"{name}" is available!
          </div>
        );
      case CompanyStatus.UNAVAILABLE:
        return (
          <div className="font-semibold text-red-600 text-center">
            ✖ "{name}" is already registered with Companies House.
          </div>
        );
      case CompanyStatus.INVALID:
        return (
          <div className="font-semibold text-red-600 text-center">
            ✖ Name must end with "LTD" or "LIMITED".
          </div>
        );
      case CompanyStatus.ERROR:
        return (
          <div className="flex items-center justify-center gap-2 font-semibold text-orange-600">
            <AlertTriangle className="h-5 w-5" />
            Could not verify with Companies House. You can still proceed.
          </div>
        );
      default:
        return (
          <p className="text-sm text-gray-500 text-center">
            End with <strong>LTD</strong> or <strong>LIMITED</strong>.
          </p>
        );
    }
  };

  const packagesToShow = activeTab === "uk" ? ukPackages : globalPackages;

  return (
    <section id="packages" className="w-full py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <AnimatePresence>
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="text-center mb-10 max-w-2xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold">
                  Check Your UK Company Name First
                </h2>
                <p className="text-gray-600 mb-8">
                  We'll verify availability with Companies House in real-time
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-2 max-w-lg mx-auto">
                  <Input
                    type="text"
                    placeholder="e.g. AVALON CONSULTING LTD"
                    className="text-center sm:text-left uppercase placeholder:normal-case"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    onKeyUp={(e) => e.key === "Enter" && handleCompanySearch()}
                  />
                  <Button
                    onClick={handleCompanySearch}
                    disabled={companyStatus === CompanyStatus.LOADING}
                    className="flex-shrink-0"
                  >
                    <Search className="h-4 w-4 mr-2" />
                    {companyStatus === CompanyStatus.LOADING
                      ? "Checking..."
                      : "Check"}
                  </Button>
                </div>
                <div className="h-8 mt-2 flex items-center justify-center">
                  {renderCompanyStatus()}
                </div>
                {packageError && (
                  <p className="text-red-600 font-semibold mt-4">
                    Please enter and validate a company name before proceeding.
                  </p>
                )}
              </div>
              <div className="flex justify-center mb-10">
                <div className="inline-flex rounded-lg border p-1">
                  <Button
                    variant={activeTab === "uk" ? "default" : "ghost"}
                    onClick={() => setActiveTab("uk")}
                    className="rounded-md"
                  >
                    UK Residents
                  </Button>
                  <Button
                    variant={activeTab === "global" ? "default" : "ghost"}
                    onClick={() => setActiveTab("global")}
                    className="rounded-md"
                  >
                    Non-UK Residents
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-7 max-w-4xl mx-auto">
                {packagesToShow.map((pkg) => (
                  <PackageCard
                    key={pkg.name}
                    plan={pkg}
                    onSelect={() => handleSelectPackage(pkg)}
                    isEnabled={!!acceptedName}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={detailsFormRef}>
          <AnimatePresence>
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-16 max-w-xl mx-auto"
              >
                <Card className="shadow-2xl overflow-hidden">
                  <div className="p-2 bg-gradient-to-r from-primary via-purple-500 to-secondary"></div>
                  <CardHeader className="text-center">
                    <FileSignature className="h-12 w-12 mx-auto text-primary" />
                    <CardTitle className="text-2xl">
                      Secure Your Company Name
                    </CardTitle>
                    <p className="text-gray-600">
                      Complete your details to reserve "{acceptedName}"
                    </p>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleFormSubmit} className="space-y-6">
                      {formError && (
                        <p className="text-sm font-semibold text-center p-3 bg-red-100 text-red-700 rounded-md">
                          {formError}
                        </p>
                      )}
                      <div className="space-y-2">
                        <Label htmlFor="fullName">Full Name *</Label>
                        <Input
                          id="fullName"
                          value={userDetails.fullName}
                          onChange={(e) =>
                            setUserDetails({
                              ...userDetails,
                              fullName: e.target.value,
                            })
                          }
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={userDetails.email}
                          onChange={(e) =>
                            setUserDetails({
                              ...userDetails,
                              email: e.target.value,
                            })
                          }
                          placeholder="Enter your email address"
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full text-lg py-6"
                      >
                        {isSubmitting ? (
                          <Loader2 className="animate-spin" />
                        ) : (
                          "Submit & See Details"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-16 max-w-2xl mx-auto"
              >
                <Card className="p-8 text-center shadow-2xl">
                  <PartyPopper className="h-16 w-16 text-secondary mx-auto mb-4" />
                  <h2 className="text-2xl font-bold">
                    Success! Your Request is In.
                  </h2>
                  <p className="text-muted-foreground mt-2">
                    Thank you, <strong>{userDetails.fullName}</strong>. We've
                    just sent a confirmation to{" "}
                    <strong>{userDetails.email}</strong> with your full package
                    details.
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    If you don't see it in the next few minutes, please check
                    your spam or junk folder.
                  </p>
                  <div className="bg-muted/50 rounded-lg p-4 my-6 text-left space-y-4 text-sm">
                    <div className="flex justify-between items-center">
                      <strong className="text-gray-600">Company:</strong>{" "}
                      <span className="font-mono bg-gray-200 px-2 py-1 rounded">
                        {acceptedName}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <strong className="text-gray-600">Package:</strong>{" "}
                      <span>{selectedPackage?.name}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-600 mb-2">
                        What's Included:
                      </p>
                      <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                        {selectedPackage?.features.map((f) => (
                          <li key={f}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mt-6">What's Next?</h3>
                  <p className="text-muted-foreground mt-2">
                    Click the link in your email to complete secure payment and
                    begin the formation process.
                  </p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="max-w-4xl mx-auto mt-28 text-center">
          <h4 className="inline-flex items-center justify-center gap-3 text-xl font-bold text-gray-800 mb-4">
            <ShieldCheck className="h-8 w-8 text-secondary" />
            <span>Your Gateway to Global Platforms</span>
          </h4>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-10">
            We provide everything you need for seamless approval with the
            world's leading financial platforms.
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
            <PartnerLogo
              src="http://goformed.co.uk/wp-content/uploads/2025/07/5968382.png"
              alt="Stripe Logo"
              name="Stripe"
            />
            <PartnerLogo
              src="http://goformed.co.uk/wp-content/uploads/2025/07/shopify-payments-logo.png.webp"
              alt="Shopify Payments Logo"
              name="Shopify Payments"
            />
            <PartnerLogo
              src="http://goformed.co.uk/wp-content/uploads/2025/07/payoneer-logo-payoneer-icon-transparent-free-png.png"
              alt="Payoneer Logo"
              name="Payoneer"
            />
            <PartnerLogo
              src="http://goformed.co.uk/wp-content/uploads/2025/07/Tidenew.png.avif"
              alt="UK Business Bank Logo"
              name="UK Bank Accounts"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

const PackageCard = ({ plan, onSelect, isEnabled }) => (
  <Card
    className={`relative flex flex-col h-full transition-all duration-300 ${
      plan.badge === "Premium" || plan.badge === "Elite" ? "border-primary" : ""
    }`}
  >
    <div
      className={`absolute top-4 right-4 text-white px-3 py-1 text-xs font-bold rounded-full ${plan.badgeClass}`}
    >
      {plan.badge}
    </div>
    <div className="p-6 flex-1 flex flex-col">
      <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
      <div className="flex items-baseline gap-2 mb-1">
        <span className="text-xl font-semibold text-gray-400 line-through">
          {plan.oldPrice}
        </span>
        <span className="text-3xl font-extrabold text-primary">
          {plan.price}
        </span>
      </div>
      <p className="text-xs text-muted-foreground mb-6">{plan.feeText}</p>
      <ul className="space-y-3 text-sm text-gray-600 flex-1">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <Button onClick={onSelect} disabled={!isEnabled} className="mt-8 w-full">
        See Details
      </Button>
    </div>
  </Card>
);

const PartnerLogo = ({ src, alt, name }) => (
  <div className="flex flex-col items-center gap-2">
    <img src={src} alt={alt} className="h-10 object-contain" />
    <span className="text-sm font-semibold text-gray-600">{name}</span>
  </div>
);
