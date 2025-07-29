// src/pages/MarketplacePage.jsx

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/supabase";
import { ukPackages, globalPackages } from "@/lib/packages";

// Material UI imports
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Check, Sparkles, Crown, Star } from "lucide-react";

// Modern Package Card with advanced animations
const PackageCard = ({ plan, onSelect, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getBadgeIcon = (badge) => {
    switch (badge) {
      case "Premium":
        return <Crown className="w-3 h-3" />;
      case "Elite":
        return <Sparkles className="w-3 h-3" />;
      default:
        return <Star className="w-3 h-3" />;
    }
  };

  const getGradientClass = (badge) => {
    switch (badge) {
      case "Premium":
        return "from-purple-600 via-purple-500 to-indigo-600";
      case "Elite":
        return "from-amber-500 via-orange-500 to-red-500";
      default:
        return "from-blue-500 via-cyan-500 to-teal-500";
    }
  };

  const isPremium = plan.badge === "Premium" || plan.badge === "Elite";

  return (
    <div
      className={`group relative transform transition-all duration-700 ease-out hover:scale-105 ${
        isPremium ? "hover:scale-110" : ""
      }`}
      style={{
        animationDelay: `${index * 150}ms`,
        animation: "slideInUp 0.8s ease-out forwards",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow Effect for Premium Plans */}
      {isPremium && (
        <div
          className={`absolute -inset-1 bg-gradient-to-r ${getGradientClass(
            plan.badge
          )} rounded-2xl blur-lg opacity-25 group-hover:opacity-50 transition-opacity duration-500`}
        />
      )}

      <Card
        className={`relative h-full backdrop-blur-sm transition-all duration-500 overflow-hidden ${
          isPremium
            ? "bg-white/90 border-2 border-transparent bg-gradient-to-br from-white via-gray-50 to-gray-100 shadow-2xl"
            : "bg-white/80 border border-gray-200 hover:border-gray-300 shadow-lg hover:shadow-xl"
        }`}
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div
            className={`absolute inset-0 bg-gradient-to-br ${getGradientClass(
              plan.badge
            )} opacity-20`}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)]" />
        </div>

        {/* Premium Badge with Animation */}
        <div
          className={`absolute -top-1 -right-1 z-10 transform transition-all duration-500 ${
            isHovered ? "scale-110 rotate-3" : "scale-100 rotate-0"
          }`}
        >
          <div
            className={`bg-gradient-to-r ${getGradientClass(
              plan.badge
            )} text-white px-4 py-2 text-xs font-bold rounded-full shadow-lg flex items-center gap-1`}
          >
            {getBadgeIcon(plan.badge)}
            {plan.badge}
          </div>
        </div>

        <CardHeader className="relative pb-4">
          <CardTitle
            className={`text-2xl font-bold mb-3 transition-all duration-300 ${
              isHovered
                ? "text-transparent bg-clip-text bg-gradient-to-r " +
                  getGradientClass(plan.badge)
                : "text-gray-800"
            }`}
          >
            {plan.name}
          </CardTitle>

          {/* Animated Price Section */}
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <span
                className={`text-lg font-medium text-gray-400 line-through transition-all duration-300 ${
                  isHovered ? "text-gray-500 transform -translate-y-1" : ""
                }`}
              >
                {plan.oldPrice}
              </span>
              <span
                className={`text-4xl font-extrabold transition-all duration-500 ${
                  isHovered
                    ? `text-transparent bg-clip-text bg-gradient-to-r ${getGradientClass(
                        plan.badge
                      )} transform scale-110`
                    : "text-gray-900"
                }`}
              >
                {plan.price}
              </span>
            </div>
            <p className="text-sm text-gray-600 font-medium">{plan.feeText}</p>
          </div>
        </CardHeader>

        <CardContent className="relative flex-1 space-y-4">
          {/* Features List with Staggered Animation */}
          <ul className="space-y-4">
            {plan.features.map((feature, featureIndex) => (
              <li
                key={feature}
                className={`flex items-start gap-3 transition-all duration-500 ${
                  isHovered ? "transform translate-x-2" : ""
                }`}
                style={{
                  transitionDelay: isHovered
                    ? `${featureIndex * 100}ms`
                    : "0ms",
                }}
              >
                <div
                  className={`relative p-1 rounded-full transition-all duration-300 ${
                    isHovered
                      ? `bg-gradient-to-r ${getGradientClass(
                          plan.badge
                        )} shadow-lg`
                      : "bg-green-100"
                  }`}
                >
                  <Check
                    className={`h-4 w-4 transition-colors duration-300 ${
                      isHovered ? "text-white" : "text-green-600"
                    }`}
                  />
                </div>
                <span
                  className={`text-sm font-medium transition-colors duration-300 ${
                    isHovered ? "text-gray-800" : "text-gray-600"
                  }`}
                >
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>

        <CardFooter className="pt-6 relative">
          <Button
            variant="contained"
            onClick={() => onSelect(plan)}
            fullWidth
            className={`!py-4 !font-bold !text-base !rounded-xl !transition-all !duration-500 !transform ${
              isHovered ? "!scale-105 !shadow-2xl" : "!shadow-lg"
            }`}
            sx={{
              background: isHovered
                ? `linear-gradient(135deg, ${
                    plan.badge === "Premium"
                      ? "#8b5cf6, #6366f1"
                      : plan.badge === "Elite"
                      ? "#f59e0b, #ef4444"
                      : "#06b6d4, #14b8a6"
                  })`
                : isPremium
                ? `linear-gradient(135deg, ${
                    plan.badge === "Premium"
                      ? "#8b5cf6, #6366f1"
                      : "#f59e0b, #ef4444"
                  })`
                : "#1976d2",
              "&:hover": {
                background: `linear-gradient(135deg, ${
                  plan.badge === "Premium"
                    ? "#7c3aed, #4f46e5"
                    : plan.badge === "Elite"
                    ? "#d97706, #dc2626"
                    : "#0891b2, #059669"
                })`,
                transform: "translateY(-2px)",
                boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
              },
            }}
          >
            <span className="flex items-center gap-2">
              {isPremium && <Sparkles className="w-4 h-4" />}
              Choose Plan
              {isPremium && <Sparkles className="w-4 h-4" />}
            </span>
          </Button>
        </CardFooter>

        {/* Hover Overlay Effect */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-white/5 transition-opacity duration-500 pointer-events-none ${
            isHovered ? "opacity-100" : "opacity-0"
          }`}
        />
      </Card>

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default function MarketplacePage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("uk");
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectPackage = (plan) => {
    setSelectedPackage(plan);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isLoading) return;
    setIsModalOpen(false);
  };

  const handleCreateRequest = async () => {
    if (!companyName.trim()) {
      alert("Please enter a company name.");
      return;
    }
    setIsLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found. Please log in again.");

      await supabase.from("company_requests").insert({
        user_id: user.id,
        company_name: companyName.trim().toUpperCase(),
        package_name: selectedPackage.name,
        status: "pending_payment",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating request:", error);
      alert(`An error occurred: ${error.message}`);
    } finally {
      setIsLoading(false);
      setIsModalOpen(false);
      setCompanyName("");
      setSelectedPackage(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" />
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"
          style={{ animationDelay: "4s" }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-12 space-y-12">
        {/* Hero Section with Animation */}
        <div className="text-center space-y-6 animate-fadeInDown">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-gray-200 text-sm font-medium text-gray-600 mb-4">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            Launch Your Business Today
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-indigo-600 to-purple-600 leading-tight">
            Our Premium Packages
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Choose the perfect package to launch your new venture with
            confidence and style.
          </p>
        </div>

        {/* Enhanced Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-white/80 backdrop-blur-sm border border-gray-200 shadow-lg rounded-2xl p-2 transition-all duration-300">
              <TabsTrigger
                value="uk"
                className="rounded-xl font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                🇬🇧 UK Residents
              </TabsTrigger>
              <TabsTrigger
                value="global"
                className="rounded-xl font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg"
              >
                🌍 Global
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="uk" className="mt-8">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2 max-w-6xl mx-auto">
              {ukPackages.map((plan, index) => (
                <PackageCard
                  key={plan.name}
                  plan={plan}
                  onSelect={handleSelectPackage}
                  index={index}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="global" className="mt-8">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2 max-w-6xl mx-auto">
              {globalPackages.map((plan, index) => (
                <PackageCard
                  key={plan.name}
                  plan={plan}
                  onSelect={handleSelectPackage}
                  index={index}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Enhanced Modal */}
        <Dialog
          open={isModalOpen}
          onClose={handleCloseModal}
          PaperProps={{
            sx: {
              borderRadius: "20px",
              padding: "8px",
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.2)",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              minWidth: "500px",
            },
          }}
          BackdropProps={{
            sx: {
              backdropFilter: "blur(8px)",
              backgroundColor: "rgba(0,0,0,0.4)",
            },
          }}
        >
          <DialogTitle
            sx={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              background: "linear-gradient(135deg, #1e293b, #6366f1)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              textAlign: "center",
              paddingBottom: "8px",
            }}
          >
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-indigo-500" />
              One Last Step
              <Sparkles className="w-6 h-6 text-indigo-500" />
            </div>
          </DialogTitle>

          <DialogContent sx={{ padding: "24px" }}>
            <DialogContentText
              sx={{
                mb: 3,
                fontSize: "1rem",
                color: "#64748b",
                textAlign: "center",
                lineHeight: 1.6,
              }}
            >
              Please enter the desired name for your new company.
              <br />
              <strong>The name must end with "LTD" or "LIMITED".</strong>
            </DialogContentText>

            <TextField
              autoFocus
              margin="dense"
              id="company-name"
              label="Company Name"
              type="text"
              fullWidth
              variant="outlined"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value.toUpperCase())}
              placeholder="e.g., MYAWESOME LTD"
              disabled={isLoading}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  fontSize: "1.1rem",
                  "&:hover fieldset": {
                    borderColor: "#6366f1",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#6366f1",
                    borderWidth: "2px",
                  },
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "#6366f1",
                },
              }}
            />
          </DialogContent>

          <DialogActions sx={{ padding: "16px 24px 24px", gap: "12px" }}>
            <Button
              onClick={handleCloseModal}
              disabled={isLoading}
              sx={{
                borderRadius: "10px",
                textTransform: "none",
                fontSize: "1rem",
                padding: "10px 24px",
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateRequest}
              variant="contained"
              disabled={isLoading}
              sx={{
                borderRadius: "10px",
                textTransform: "none",
                fontSize: "1rem",
                padding: "10px 24px",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                "&:hover": {
                  background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
                  transform: "translateY(-1px)",
                  boxShadow: "0 10px 25px rgba(99, 102, 241, 0.4)",
                },
                transition: "all 0.3s ease",
              }}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <CircularProgress size={20} sx={{ color: "white" }} />
                  Processing...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Create & Proceed
                </div>
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </div>

      <style jsx global>{`
        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInDown {
          animation: fadeInDown 0.8s ease-out;
        }
      `}</style>
    </div>
  );
}
