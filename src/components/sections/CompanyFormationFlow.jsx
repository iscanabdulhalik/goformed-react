import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "lucide-react"; // AlertTriangle ikonu eklendi
import { Link } from "react-router-dom";

// Paket verileri (değişiklik yok)
const ukPackages = [
  {
    name: "Entrepreneur (UK)",
    oldPrice: "£449",
    price: "£149",
    feeText: "+ £50 Companies House fee included",
    features: [
      "UK Company Formation",
      "Payoneer UK Business Account",
      "Stripe & Shopify Setup Guide",
      "London Registered Office",
      "Basic Support",
    ],
    badge: "Popular",
    badgeClass: "bg-green-600",
  },
  {
    name: "Pro Builder (UK)",
    oldPrice: "£599",
    price: "£249",
    feeText: "+ £50 Companies House fee included",
    features: [
      "Everything in Entrepreneur",
      "VAT Registration",
      "Printed Documents",
      "PAYE Registration",
      "Priority Support",
    ],
    badge: "Premium",
    badgeClass: "bg-purple-600",
  },
];
const globalPackages = [
  {
    name: "Global Starter",
    oldPrice: "£549",
    price: "£199",
    feeText: "+ £50 Companies House fee included",
    features: [
      "Everything in Entrepreneur",
      "Extra ID verification support",
      "Document assistance",
      "International address proof setup (for Stripe & UK bank account)",
    ],
    badge: "International",
    badgeClass: "bg-blue-600",
  },
  {
    name: "Global Premium",
    oldPrice: "£649",
    price: "£249",
    feeText: "+ £50 Companies House fee included",
    features: [
      "Everything in Global Starter",
      "VAT & PAYE Registration",
      "Printed Documents",
      "Shopify Store Support",
      "Business Email & Hosting",
    ],
    badge: "Elite",
    badgeClass: "bg-gray-800",
  },
];

const CompanyStatus = {
  IDLE: "idle",
  LOADING: "loading",
  AVAILABLE: "available",
  UNAVAILABLE: "unavailable",
  ERROR: "error",
  INVALID: "invalid",
};

export default function CompanyFormationFlow() {
  // State'ler ve ref'ler (değişiklik yok)
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
  const apiDebounceTimer = useRef(null);

  useEffect(() => {
    setAcceptedName("");
    setCompanyStatus(CompanyStatus.IDLE);
    setPackageError(false);
  }, [companyName]);

  const handleCompanySearch = () => {
    const name = companyName.toUpperCase().trim();
    if (name.length < 4) return;
    if (!name.endsWith("LTD") && !name.endsWith("LIMITED")) {
      setCompanyStatus(CompanyStatus.INVALID);
      return;
    }

    setCompanyStatus(CompanyStatus.LOADING);
    clearTimeout(apiDebounceTimer.current);

    apiDebounceTimer.current = setTimeout(async () => {
      try {
        // YENİ: İstek artık kendi backend'imize yapılıyor.
        // Authorization başlığına burada gerek yok, backend halledecek.
        const response = await fetch(
          `${
            import.meta.env.VITE_BACKEND_URL
          }/check-company-name?q=${encodeURIComponent(name)}`
        );

        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        const data = await response.json();

        if (
          data.items &&
          data.items.length > 0 &&
          data.items.some((item) => item.title.toUpperCase() === name)
        ) {
          setCompanyStatus(CompanyStatus.UNAVAILABLE);
        } else {
          setCompanyStatus(CompanyStatus.AVAILABLE);
          setAcceptedName(name);
          setTimeout(() => {
            const pricingElement =
              document.getElementById("packages-container");
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
    }, 300);
  };

  // handleSelectPackage ve handleFormSubmit (değişiklik yok)
  const handleSelectPackage = (pkg) => {
    if (!acceptedName) {
      setPackageError(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setPackageError(false);
    setSelectedPackage(pkg);
    setStep(2);
    setTimeout(
      () =>
        detailsFormRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        }),
      100
    );
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
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/submit-formation-request`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fullName: userDetails.fullName,
            email: userDetails.email,
            companyName: acceptedName,
            packageName: selectedPackage.name,
          }),
        }
      );

      if (!response.ok) throw new Error("Backend request failed");

      setStep(3);
      window.scrollTo({
        top: detailsFormRef.current.offsetTop - 150,
        behavior: "smooth",
      });
    } catch (error) {
      console.error("Form submission error:", error);
      setFormError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // renderCompanyStatus fonksiyonunu daha bilgilendirici hale getirme
  const renderCompanyStatus = () => {
    const name = companyName.toUpperCase().trim();
    switch (companyStatus) {
      case CompanyStatus.LOADING:
        return (
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <Loader2 className="animate-spin h-4 w-4" />
            Checking availability...
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
          <div className="font-semibold text-red-600">
            ✖ "{name}" is already taken.
          </div>
        );
      case CompanyStatus.INVALID:
        return (
          <div className="font-semibold text-red-600">
            ✖ Name must end with "LTD" or "LIMITED".
          </div>
        );
      case CompanyStatus.ERROR:
        return (
          <div className="flex items-center justify-center gap-2 font-semibold text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Could not verify name. Please try again.
          </div>
        );
      default:
        return (
          <p className="text-sm text-gray-500">
            Only names ending in <strong>LTD</strong> or{" "}
            <strong>LIMITED</strong> are allowed.
          </p>
        );
    }
  };

  const packagesToShow = activeTab === "uk" ? ukPackages : globalPackages;

  return (
    <section id="packages" className="w-full py-24 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* --- Adım 1: Arama ve Paketler --- */}
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
                    <Search className="h-4 w-4 mr-2" /> Check
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

        {/* --- Adım 2: Form ve Başarı Ekranı --- */}
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
                      <span>{selectedPackage.name}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-600 mb-2">
                        What’s Included:
                      </p>
                      <ul className="space-y-1 list-disc list-inside text-muted-foreground">
                        {selectedPackage.features.map((f) => (
                          <li key={f}>{f}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold mt-6">What’s Next?</h3>
                  <p className="text-muted-foreground mt-2">
                    To begin the 4-day formation process, please complete your
                    secure payment via the link sent to your email.
                  </p>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* --- Gateway Logos --- */}
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
