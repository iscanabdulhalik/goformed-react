// src/pages/admin/AdminCompanyManagement.jsx - Enhanced Company Management with real data
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/supabase";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building,
  Search,
  Filter,
  Eye,
  Clock,
  CheckCircle,
  AlertTriangle,
  Ban,
  Loader2,
  ArrowUpDown,
  MoreHorizontal,
  Download,
  RefreshCw,
  Users,
  TrendingUp,
  FileText,
  DollarSign,
} from "lucide-react";

// Status configuration
const statusConfig = {
  pending_payment: {
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    icon: Clock,
    label: "Pending Payment",
    progress: 10,
  },
  payment_completed: {
    color: "bg-blue-100 text-blue-800 border-blue-300",
    icon: CheckCircle,
    label: "Payment Completed",
    progress: 25,
  },
  in_review: {
    color: "bg-blue-100 text-blue-800 border-blue-300",
    icon: Clock,
    label: "In Review",
    progress: 50,
  },
  documents_requested: {
    color: "bg-orange-100 text-orange-800 border-orange-300",
    icon: AlertTriangle,
    label: "Documents Required",
    progress: 35,
  },
  processing: {
    color: "bg-purple-100 text-purple-800 border-purple-300",
    icon: Clock,
    label: "Processing",
    progress: 75,
  },
  completed: {
    color: "bg-green-100 text-green-800 border-green-300",
    icon: CheckCircle,
    label: "Completed",
    progress: 100,
  },
  rejected: {
    color: "bg-red-100 text-red-800 border-red-300",
    icon: Ban,
    label: "Rejected",
    progress: 0,
  },
  cancelled: {
    color: "bg-gray-100 text-gray-800 border-gray-300",
    icon: Ban,
    label: "Cancelled",
    progress: 0,
  },
};

export default function AdminCompanyManagement() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    totalRevenue: 0,
  });

  // Filters and search
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, sortBy, sortOrder]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      console.log("🔍 Fetching company requests...");

      let query = supabase.from("company_requests").select("*");

      if (statusFilter !== "all") {
        query = query.eq("status", statusFilter);
      }

      query = query.order(sortBy, { ascending: sortOrder === "asc" });

      const { data: requests, error } = await query;

      if (error) {
        console.error("❌ Error fetching requests:", error);
        throw error;
      }

      console.log("✅ Fetched requests:", requests?.length || 0);

      // ✅ Debug: İlk request'in user_details'ını kontrol et
      if (requests && requests.length > 0) {
        console.log(
          "🔍 Sample request user_details:",
          requests[0].user_details
        );
      }

      // ✅ Profiles'ları çek
      const userIds = [
        ...new Set(requests?.map((r) => r.user_id).filter(Boolean)),
      ];

      let userProfiles = {};

      if (userIds.length > 0) {
        const { data: profiles, error: profileError } = await supabase
          .from("profiles")
          .select("id, full_name")
          .in("id", userIds);

        if (!profileError && profiles) {
          profiles.forEach((profile) => {
            userProfiles[profile.id] = profile;
          });
          console.log("✅ Fetched profiles for", profiles.length, "users");
        }
      }

      // ✅ FIXED: Multiple fallback sources for user info
      const requestsWithProfiles = (requests || []).map((request) => {
        const userProfile = userProfiles[request.user_id];
        const userDetails = request.user_details;

        // ✅ Better name handling
        let fullName = "Unknown User";

        if (userProfile?.full_name && userProfile.full_name !== null) {
          fullName = userProfile.full_name;
        } else if (userDetails?.fullName) {
          fullName = userDetails.fullName;
        } else if (userDetails?.personalDetails?.fullName) {
          fullName = userDetails.personalDetails.fullName;
        } else if (
          userDetails?.personalDetails?.firstName &&
          userDetails?.personalDetails?.lastName
        ) {
          fullName = `${userDetails.personalDetails.firstName} ${userDetails.personalDetails.lastName}`;
        } else if (userDetails?.firstName && userDetails?.lastName) {
          fullName = `${userDetails.firstName} ${userDetails.lastName}`;
        }

        // ✅ Better email handling
        const email =
          userDetails?.personalDetails?.contactEmail ||
          userDetails?.personalDetails?.email ||
          userDetails?.contactEmail ||
          userDetails?.email ||
          "No email provided";

        console.log(`👤 User ${request.user_id}:`, {
          fullName,
          email,
          userProfile: userProfile?.full_name,
          userDetails: userDetails?.personalDetails || userDetails,
        });

        return {
          ...request,
          user_profile: {
            full_name: fullName,
            email: email,
          },
        };
      });

      setRequests(requestsWithProfiles);

      // Stats hesaplama
      const total = requestsWithProfiles.length;
      const pending = requestsWithProfiles.filter(
        (r) => r.status === "pending_payment"
      ).length;
      const inProgress = requestsWithProfiles.filter((r) =>
        [
          "payment_completed",
          "in_review",
          "documents_requested",
          "processing",
        ].includes(r.status)
      ).length;
      const completed = requestsWithProfiles.filter(
        (r) => r.status === "completed"
      ).length;

      const totalRevenue = requestsWithProfiles.reduce((sum, req) => {
        const price = parseFloat(req.package_price || 0);
        return sum + (isNaN(price) ? 0 : price);
      }, 0);

      const newStats = { total, pending, inProgress, completed, totalRevenue };
      console.log("📈 Calculated stats:", newStats);
      setStats(newStats);
    } catch (error) {
      console.error("💥 Error in fetchRequests:", error);
      alert(`Error loading requests: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfiles = async (requests) => {
    try {
      console.log("👥 Fetching user profiles...");

      const userIds = [...new Set(requests.map((r) => r.user_id))];

      if (userIds.length === 0) return {};

      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, full_name, email")
        .in("id", userIds);

      if (error) {
        console.warn("⚠️ Could not fetch profiles:", error.message);
        return {};
      }

      // Create a lookup object
      const profileLookup = {};
      profiles?.forEach((profile) => {
        profileLookup[profile.id] = profile;
      });

      console.log("✅ Fetched profiles for", profiles?.length, "users");
      return profileLookup;
    } catch (error) {
      console.warn("⚠️ Error fetching profiles:", error);
      return {};
    }
  };

  // Filter requests based on search term
  const filteredRequests = requests.filter(
    (request) =>
      request.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.profiles?.full_name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      request.id.includes(searchTerm) ||
      request.package_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("desc");
    }
  };

  const handleViewRequest = (requestId) => {
    navigate(`/admin/companies/${requestId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading company requests...</p>
        </div>
      </div>
    );
  }

  if (!requests && !loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Error Loading Data
          </h3>
          <p className="text-gray-600 mb-4">
            Could not load company requests from database
          </p>
          <Button onClick={fetchRequests} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Company Management
          </h1>
          <p className="text-gray-600 text-sm mt-1">
            Review and manage company formation requests
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchRequests} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Requests</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.total}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Pending Payment</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pending}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.inProgress}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.completed}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  £{stats.totalRevenue.toFixed(0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by company name, user, or request ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {Object.entries(statusConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <config.icon className="h-4 w-4" />
                      {config.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={`${sortBy}-${sortOrder}`}
              onValueChange={(value) => {
                const [field, order] = value.split("-");
                setSortBy(field);
                setSortOrder(order);
              }}
            >
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at-desc">Newest First</SelectItem>
                <SelectItem value="created_at-asc">Oldest First</SelectItem>
                <SelectItem value="company_name-asc">Company A-Z</SelectItem>
                <SelectItem value="company_name-desc">Company Z-A</SelectItem>
                <SelectItem value="package_price-desc">
                  Price High-Low
                </SelectItem>
                <SelectItem value="package_price-asc">
                  Price Low-High
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Company Requests ({filteredRequests.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12">
              <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No requests found
              </h3>
              <p className="text-gray-600">
                {searchTerm || statusFilter !== "all"
                  ? "Try adjusting your search or filters"
                  : "No company formation requests yet"}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("company_name")}
                    >
                      <div className="flex items-center gap-2">
                        Company Name
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Package</TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("package_price")}
                    >
                      <div className="flex items-center gap-2">
                        Price
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => handleSort("created_at")}
                    >
                      <div className="flex items-center gap-2">
                        Created
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => {
                    const status =
                      statusConfig[request.status] ||
                      statusConfig.pending_payment;
                    const StatusIcon = status.icon;

                    return (
                      <TableRow key={request.id} className="hover:bg-gray-50">
                        <TableCell>
                          <div>
                            <p className="font-medium text-gray-900">
                              {request.company_name}
                            </p>
                            <p className="text-sm text-gray-500">
                              ID: {request.id.slice(0, 8)}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-gray-900">
                              {request.user_profile?.full_name ||
                                "Unknown User"}
                            </p>
                            <p className="text-sm text-gray-500">
                              {request.user_profile?.email || "No email"}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-gray-900">
                            {request.package_name}
                          </p>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-gray-900">
                            £{parseFloat(request.package_price || 0).toFixed(2)}
                          </p>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${status.color} border text-xs`}>
                            <StatusIcon className="mr-1 h-3 w-3" />
                            {status.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="w-24">
                            <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
                              <span>{status.progress}%</span>
                            </div>
                            <Progress value={status.progress} className="h-1" />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="text-sm text-gray-900">
                              {new Date(
                                request.created_at
                              ).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(
                                request.created_at
                              ).toLocaleTimeString()}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleViewRequest(request.id)}
                              variant="outline"
                              size="sm"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
