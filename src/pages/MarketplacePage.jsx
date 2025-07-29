// src/pages/MarketplacePage.jsx - Duplikasyon kontrolü ile
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
import Alert from "@mui/material/Alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Check, Sparkles, Crown, Star } from "lucide-react";

// PackageCard component (önceki versiyondan aynı)
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

  const getBadgeColor = (badge) => {
    switch (badge) {
      case "Premium":
        return "bg-blue-600";
      case "Elite":
        return "bg-purple-600";
      default:
        return "bg-green-600";
    }
  };

  const isPremium = plan.badge === "Premium" || plan.badge === "Elite";

  return (
    <div
      className="group transform transition-all duration-300 ease-out hover:scale-105"
      style={{
        animationDelay: `${index * 100}ms`,
        animation: "slideInUp 0.6s ease-out forwards",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card
        className={`
        relative h-full backdrop-blur-sm transition-all duration-300 overflow-hidden
        ${
          isPremium
            ? "bg-white border-2 border-blue-200 shadow-lg hover:shadow-xl"
            : "bg-white border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-md"
        }
      `}
      >
        <div className="absolute top-4 right-4 z-10">
          <div
            className={`
            ${getBadgeColor(plan.badge)} text-white px-3 py-1 text-xs 
            font-medium rounded-full shadow-sm flex items-center gap-1
            transition-transform duration-300 ${isHovered ? "scale-105" : ""}
          `}
          >
            {getBadgeIcon(plan.badge)}
            {plan.badge}
          </div>
        </div>

        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-semibold mb-3 text-gray-900">
            {plan.name}
          </CardTitle>
          <div className="space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-base font-normal text-gray-400 line-through">
                {plan.oldPrice}
              </span>
              <span className="text-3xl font-bold text-gray-900">
                {plan.price}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-normal">{plan.feeText}</p>
          </div>
        </CardHeader>

        <CardContent className="flex-1 space-y-4">
          <ul className="space-y-3">
            {plan.features.map((feature, featureIndex) => (
              <li
                key={feature}
                className="flex items-start gap-3 transition-transform duration-200"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <Check className="h-4 w-4 text-green-500" />
                </div>
                <span className="text-sm text-gray-600 font-normal leading-relaxed">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>

        <CardFooter className="pt-6">
          <Button
            variant="contained"
            onClick={() => onSelect(plan)}
            fullWidth
            className="!py-3 !font-medium !text-base !rounded-lg !transition-all !duration-300"
            sx={{
              background: isPremium
                ? "linear-gradient(135deg, #3b82f6, #6366f1)"
                : "#1f2937",
              "&:hover": {
                background: isPremium
                  ? "linear-gradient(135deg, #2563eb, #4f46e5)"
                  : "#374151",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              },
            }}
          >
            Choose Plan
          </Button>
        </CardFooter>
      </Card>
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
  const [error, setError] = useState("");

  const handleSelectPackage = (plan) => {
    setSelectedPackage(plan);
    setIsModalOpen(true);
    setError("");
  };

  const handleCloseModal = () => {
    if (isLoading) return;
    setIsModalOpen(false);
    setError("");
    setCompanyName("");
  };

  const checkDuplicateCompany = async (companyName, userId) => {
    const { data, error } = await supabase
      .from("company_requests")
      .select("id, company_name, status")
      .eq("user_id", userId)
      .eq("company_name", companyName.trim().toUpperCase());

    if (error) throw error;
    return data && data.length > 0;
  };

  const handleCreateRequest = async () => {
    if (!companyName.trim()) {
      setError("Please enter a company name.");
      return;
    }

    const normalizedName = companyName.trim().toUpperCase();

    if (
      !normalizedName.endsWith("LTD") &&
      !normalizedName.endsWith("LIMITED")
    ) {
      setError("Company name must end with 'LTD' or 'LIMITED'.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not found. Please log in again.");

      // Duplikasyon kontrolü
      const isDuplicate = await checkDuplicateCompany(normalizedName, user.id);
      if (isDuplicate) {
        setError(
          "You already have a request for this company name. Please choose a different name."
        );
        setIsLoading(false);
        return;
      }

      await supabase.from("company_requests").insert({
        user_id: user.id,
        company_name: normalizedName,
        package_name: selectedPackage.name,
        status: "pending_payment",
      });

      navigate("/dashboard");
    } catch (error) {
      console.error("Error creating request:", error);
      setError(`An error occurred: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12 space-y-12">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-gray-200 text-sm font-normal text-gray-600 mb-4">
            <Sparkles className="w-4 h-4 text-blue-500" />
            Choose Your Business Package
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
            Launch Your Business Today
          </h1>

          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-normal leading-relaxed">
            Select the perfect package to start your entrepreneurial journey
            with confidence.
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="grid w-full max-w-md grid-cols-2 bg-white border border-gray-200 shadow-sm rounded-lg p-1">
              <TabsTrigger
                value="uk"
                className="rounded-md font-medium text-sm transition-all duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                🇬🇧 UK Residents
              </TabsTrigger>
              <TabsTrigger
                value="global"
                className="rounded-md font-medium text-sm transition-all duration-200 data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm"
              >
                🌍 Global
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="uk" className="mt-8">
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2 max-w-5xl mx-auto">
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
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2 max-w-5xl mx-auto">
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

        {/* Modal */}
        <Dialog
          open={isModalOpen}
          onClose={handleCloseModal}
          PaperProps={{
            sx: {
              borderRadius: "12px",
              padding: "8px",
              background: "white",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
              minWidth: "480px",
            },
          }}
        >
          <DialogTitle
            sx={{
              fontSize: "1.25rem",
              fontWeight: "600",
              color: "#111827",
              textAlign: "center",
            }}
          >
            Complete Your Request
          </DialogTitle>

          <DialogContent sx={{ padding: "20px" }}>
            <DialogContentText
              sx={{
                mb: 3,
                fontSize: "0.95rem",
                color: "#6b7280",
                textAlign: "center",
                lineHeight: 1.5,
              }}
            >
              Please enter your desired company name to continue.
              <br />
              <strong>Name must end with "LTD" or "LIMITED".</strong>
            </DialogContentText>

            {error && (
              <Alert severity="error" sx={{ mb: 2, fontSize: "0.9rem" }}>
                {error}
              </Alert>
            )}

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
              error={!!error}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: "normal",
                },
              }}
            />
          </DialogContent>

          <DialogActions sx={{ padding: "16px 20px 20px", gap: "8px" }}>
            <Button
              onClick={handleCloseModal}
              disabled={isLoading}
              sx={{ textTransform: "none", color: "#6b7280" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateRequest}
              variant="contained"
              disabled={isLoading}
              sx={{
                textTransform: "none",
                background: "#3b82f6",
                "&:hover": { background: "#2563eb" },
              }}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <CircularProgress size={16} sx={{ color: "white" }} />
                  Processing...
                </div>
              ) : (
                "Create Request"
              )}
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
}
