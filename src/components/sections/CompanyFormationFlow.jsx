// src/pages/CompanyFormationPage.jsx - Dedicated page for company formation
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Search,
  Loader2,
  PartyPopper,
  ShieldCheck,
  FileSignature,
  AlertTriangle,
  Check,
  Building2,
  ArrowLeft,
} from "lucide-react";

const CompanyStatus = {
  IDLE: "idle",
  LOADING: "loading",
  AVAILABLE: "available",
  UNAVAILABLE: "unavailable",
  ERROR: "error",
  INVALID: "invalid",
};

export default function CompanyFormationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const selectedPackage = location.state?.selectedPackage;

  const [step, setStep] = useState(1);
  const [companyName, setCompanyName] = useState("");
  const [companyStatus, setCompanyStatus] = useState(CompanyStatus.IDLE);
  const [acceptedName, setAcceptedName] = useState("");
  const [userDetails, setUserDetails] = useState({ fullName: "", email: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [user, setUser] = useState(null);
  const detailsFormRef = useRef(null);

  // Redirect if no package selected
  useEffect(() => {
    if (!selectedPackage) {
      navigate("/dashboard", { replace: true });
    }
  }, [selectedPackage, navigate]);

  // Get current user
  useEffect(() => {
    const getUser = async () => {
      try {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser();
        if (error) throw error;
        setUser(user);

        if (user) {
          setUserDetails({
            fullName: user.user_metadata?.full_name || "",
            email: user.email || "",
          });
        }
      } catch (error) {
        console.error("Error getting user:", error);
        navigate("/login");
      }
    };
    getUser();
  }, [navigate]);

  const handleCompanySearch = async () => {
    const name = companyName.toUpperCase().trim();
    if (!name.endsWith("LTD") && !name.endsWith("LIMITED")) {
      setCompanyStatus(CompanyStatus.INVALID);
      return;
    }

    setCompanyStatus(CompanyStatus.LOADING);

    try {
      console.log("Searching for company:", name);

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

      // Check for exact match
      const exactMatch = data.items?.find(
        (item) => item.title.toUpperCase().trim() === name
      );

      if (exactMatch) {
        setCompanyStatus(CompanyStatus.UNAVAILABLE);
      } else {
        setCompanyStatus(CompanyStatus.AVAILABLE);
        setAcceptedName(name);
        setTimeout(() => {
          const detailsElement = document.getElementById("details-section");
          detailsElement?.scrollIntoView({
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

    if (!acceptedName) {
      setFormError("Please search and validate a company name first.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (!user) {
        // Send magic link
        const { error: authError } = await supabase.auth.signInWithOtp({
          email: userDetails.email,
          options: {
            data: {
              full_name: userDetails.fullName,
            },
          },
        });

        if (authError) throw authError;

        // Store pending request
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

      // Check for duplicate requests
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

      // Create request
      const { error } = await supabase.from("company_requests").insert({
        user_id: user.id,
        company_name: acceptedName,
        package_name: selectedPackage.name,
        package_price: selectedPackage.price.replace("£", ""),
        user_details: {
          fullName: userDetails.fullName,
          email: userDetails.email,
        },
      });

      if (error) throw error;

      // Log activity
      await supabase.rpc("log_activity", {
        p_user_id: user.id,
        p_action: "company_request_created",
        p_description: `Company request created for ${acceptedName}`,
        p_metadata: {
          company_name: acceptedName,
          package_name: selectedPackage.name,
          package_price: selectedPackage.price,
        },
      });

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

  if (!selectedPackage) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => navigate("/dashboard")}
            variant="ghost"
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Company Formation
            </h1>
            <p className="text-gray-600">
              Complete your UK company formation with {selectedPackage.name}
            </p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="flex items-center justify-center">
            <div className="flex items-center space-x-4">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step >= 1
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                1
              </div>
              <div
                className={`h-1 w-12 ${
                  step >= 2 ? "bg-blue-600" : "bg-gray-300"
                }`}
              ></div>
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step >= 2
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                2
              </div>
              <div
                className={`h-1 w-12 ${
                  step >= 3 ? "bg-blue-600" : "bg-gray-300"
                }`}
              ></div>
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  step >= 3
                    ? "bg-blue-600 text-white"
                    : "bg-gray-300 text-gray-600"
                }`}
              >
                3
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-2 text-sm text-gray-600 max-w-xs mx-auto">
            <span>Company Name</span>
            <span>Your Details</span>
            <span>Complete</span>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="shadow-xl">
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl flex items-center justify-center gap-2">
                    <Building2 className="h-6 w-6 text-blue-600" />
                    Check Your Company Name
                  </CardTitle>
                  <p className="text-gray-600">
                    We'll verify availability with Companies House in real-time
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Selected Package Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-blue-900">
                            Selected Package: {selectedPackage.name}
                          </h3>
                          <p className="text-blue-700 text-sm">
                            {selectedPackage.feeText}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600">
                            {selectedPackage.price}
                          </div>
                          {selectedPackage.oldPrice && (
                            <div className="text-sm text-gray-500 line-through">
                              {selectedPackage.oldPrice}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Company Name Input */}
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row gap-2">
                        <Input
                          type="text"
                          placeholder="e.g. AVALON CONSULTING LTD"
                          className="text-center sm:text-left uppercase placeholder:normal-case"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          onKeyUp={(e) =>
                            e.key === "Enter" && handleCompanySearch()
                          }
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

                      <div className="h-8 flex items-center justify-center">
                        {renderCompanyStatus()}
                      </div>

                      {companyStatus === CompanyStatus.AVAILABLE && (
                        <Button
                          onClick={() => setStep(2)}
                          className="w-full bg-green-600 hover:bg-green-700"
                        >
                          Continue with "{acceptedName}"
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="max-w-2xl mx-auto"
              id="details-section"
            >
              <Card className="shadow-xl">
                <CardHeader className="text-center">
                  <FileSignature className="h-12 w-12 mx-auto text-blue-600 mb-4" />
                  <CardTitle className="text-2xl">Your Details</CardTitle>
                  <p className="text-gray-600">
                    Complete your details to reserve "{acceptedName}"
                  </p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleFormSubmit} className="space-y-6">
                    {formError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-sm font-semibold text-red-700">
                          {formError}
                        </p>
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
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

                      <div>
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
                    </div>

                    {/* Package Summary */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <h4 className="font-semibold text-gray-900">
                        Order Summary
                      </h4>
                      <div className="flex justify-between items-center">
                        <span>Company Name:</span>
                        <span className="font-mono bg-blue-100 px-2 py-1 rounded text-sm">
                          {acceptedName}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Package:</span>
                        <span>{selectedPackage.name}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Price:</span>
                        <span className="font-bold text-blue-600">
                          {selectedPackage.price}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        onClick={() => setStep(1)}
                        variant="outline"
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="animate-spin mr-2 h-4 w-4" />
                            Submitting...
                          </>
                        ) : (
                          "Submit Request"
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-2xl mx-auto"
            >
              <Card className="shadow-xl text-center">
                <CardContent className="p-8">
                  <PartyPopper className="h-16 w-16 text-green-500 mx-auto mb-4" />

                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Request Submitted Successfully!
                  </h2>

                  <p className="text-gray-600 mb-6">
                    Thank you, <strong>{userDetails.fullName}</strong>. We've
                    received your company formation request for{" "}
                    <strong>{acceptedName}</strong>.
                  </p>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
                    <h3 className="font-semibold text-green-900 mb-3">
                      What happens next?
                    </h3>
                    <div className="space-y-2 text-sm text-green-800">
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        <span>
                          We'll review your application within 24 hours
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        <span>You'll receive an email with next steps</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="h-4 w-4" />
                        <span>
                          Company formation typically takes 24-48 hours
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                    <h4 className="font-semibold text-blue-900 mb-2">
                      Order Details
                    </h4>
                    <div className="space-y-1 text-sm text-blue-800">
                      <div className="flex justify-between">
                        <span>Company:</span>
                        <span className="font-mono">{acceptedName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Package:</span>
                        <span>{selectedPackage.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Price:</span>
                        <span className="font-bold">
                          {selectedPackage.price}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button
                      onClick={() => navigate("/dashboard")}
                      className="w-full bg-blue-600 hover:bg-blue-700"
                    >
                      Go to Dashboard
                    </Button>

                    <Button
                      onClick={() => navigate("/dashboard/marketplace")}
                      variant="outline"
                      className="w-full"
                    >
                      Browse Additional Services
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Features Section */}
        {step < 3 && (
          <div className="max-w-4xl mx-auto mt-16">
            <div className="text-center mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Why Choose {selectedPackage.name}?
              </h3>
              <p className="text-gray-600">
                Everything you need to get your business started
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedPackage.features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-4 bg-white rounded-lg shadow-sm border"
                >
                  <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Support Section */}
        <div className="max-w-4xl mx-auto mt-16">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-100 rounded-full">
                    <ShieldCheck className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Need Help?</h3>
                    <p className="text-sm text-gray-600">
                      Our expert team is here to assist you throughout the
                      process
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Live Chat
                  </Button>
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    Contact Support
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
