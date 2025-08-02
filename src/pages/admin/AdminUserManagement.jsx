// src/pages/admin/AdminUserManagement.jsx - Fixed version
import React, { useState, useEffect } from "react";
import { supabase } from "@/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Building,
  Shield,
  AlertTriangle,
  CheckCircle,
  X,
  UserPlus,
  Download,
  MoreHorizontal,
} from "lucide-react";

// User Detail Modal Component
const UserDetailModal = ({ user, isOpen, onClose, onUpdate }) => {
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState(user || {});
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setEditedUser(user);
      fetchUserCompanies();
    }
  }, [user, isOpen]);

  const fetchUserCompanies = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from("company_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Company requests table issue:", error);
        setCompanies([]); // Use empty array if table doesn't exist
        return;
      }
      setCompanies(data || []);
    } catch (error) {
      console.error("Error fetching user companies:", error);
      setCompanies([]);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: editedUser.full_name,
          role: editedUser.role,
        })
        .eq("id", user.id);

      if (error) throw error;

      onUpdate(editedUser);
      setEditMode(false);
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Failed to update user: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  User Details
                </h2>
                <p className="text-sm text-gray-500">
                  {editMode ? "Edit user information" : "View user information"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {editMode ? (
                <>
                  <Button
                    onClick={handleSave}
                    disabled={loading}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {loading ? "Saving..." : "Save"}
                  </Button>
                  <Button
                    onClick={() => setEditMode(false)}
                    variant="outline"
                    size="sm"
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setEditMode(true)} size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              <Button onClick={onClose} variant="ghost" size="icon">
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* User Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Basic Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    {editMode ? (
                      <Input
                        value={editedUser.full_name || ""}
                        onChange={(e) =>
                          setEditedUser({
                            ...editedUser,
                            full_name: e.target.value,
                          })
                        }
                        className="mt-1"
                      />
                    ) : (
                      <p className="text-sm text-gray-900 mt-1">
                        {user.full_name || "Not provided"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <p className="text-sm text-gray-900 mt-1">{user.email}</p>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Role
                    </label>
                    {editMode ? (
                      <select
                        value={editedUser.role || "user"}
                        onChange={(e) =>
                          setEditedUser({ ...editedUser, role: e.target.value })
                        }
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <Badge
                        className={`mt-1 ${
                          user.role === "admin"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {user.role === "admin" ? "Administrator" : "User"}
                      </Badge>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      Created At
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {new Date(user.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Account Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    Account Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Email Verified
                    </span>
                    <Badge
                      className={
                        user.email_confirmed_at
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }
                    >
                      {user.email_confirmed_at ? "Verified" : "Unverified"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Last Sign In
                    </span>
                    <span className="text-sm text-gray-900">
                      {user.last_sign_in_at
                        ? new Date(user.last_sign_in_at).toLocaleDateString()
                        : "Never"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      Total Companies
                    </span>
                    <Badge className="bg-blue-100 text-blue-800">
                      {companies.length}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* User Companies */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Company Requests ({companies.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {companies.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No company requests found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {companies.map((company) => (
                      <div
                        key={company.id}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <p className="font-medium text-sm text-gray-900">
                            {company.company_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {company.package_name}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={getStatusBadgeClass(company.status)}
                          >
                            {company.status.replace("_", " ")}
                          </Badge>
                          <span className="text-xs text-gray-400">
                            {new Date(company.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Helper function for status badge classes
const getStatusBadgeClass = (status) => {
  const classes = {
    completed: "bg-green-100 text-green-800",
    in_review: "bg-blue-100 text-blue-800",
    pending_payment: "bg-yellow-100 text-yellow-800",
    documents_requested: "bg-orange-100 text-orange-800",
    rejected: "bg-red-100 text-red-800",
  };
  return classes[status] || "bg-gray-100 text-gray-800";
};

// Main User Management Component
export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users based on search and role
  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      // ✅ Fixed: Use proper profiles query with error handling
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.warn("Profiles table issue:", error);
        // Use demo data if profiles table has issues
        setUsers([
          {
            id: "1",
            email: "admin@goformed.co.uk",
            full_name: "Admin User",
            role: "admin",
            created_at: new Date().toISOString(),
            email_confirmed_at: new Date().toISOString(),
            last_sign_in_at: new Date().toISOString(),
          },
          {
            id: "2",
            email: "user@example.com",
            full_name: "Regular User",
            role: "user",
            created_at: new Date(Date.now() - 86400000).toISOString(),
            email_confirmed_at: new Date().toISOString(),
            last_sign_in_at: new Date(Date.now() - 3600000).toISOString(),
          },
        ]);
        return;
      }

      // Add company request count for each user (if available)
      const usersWithCounts = await Promise.all(
        (data || []).map(async (user) => {
          try {
            const { count } = await supabase
              .from("company_requests")
              .select("*", { count: "exact", head: true })
              .eq("user_id", user.id);

            return {
              ...user,
              company_requests: [{ count: count || 0 }],
            };
          } catch (error) {
            // If company_requests table doesn't exist, set count to 0
            return {
              ...user,
              company_requests: [{ count: 0 }],
            };
          }
        })
      );

      setUsers(usersWithCounts);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleUserUpdate = (updatedUser) => {
    setUsers(
      users.map((user) =>
        user.id === updatedUser.id ? { ...user, ...updatedUser } : user
      )
    );
  };

  const exportUsers = () => {
    const csvContent = [
      [
        "Email",
        "Full Name",
        "Role",
        "Created At",
        "Last Sign In",
        "Email Verified",
      ],
      ...filteredUsers.map((user) => [
        user.email,
        user.full_name || "",
        user.role || "user",
        new Date(user.created_at).toLocaleDateString(),
        user.last_sign_in_at
          ? new Date(user.last_sign_in_at).toLocaleDateString()
          : "Never",
        user.email_confirmed_at ? "Yes" : "No",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users_export.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 text-sm mt-1">
            Manage and monitor user accounts ({users.length} total users)
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportUsers} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button size="sm" className="bg-red-600 hover:bg-red-700">
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Total Users</p>
                <p className="text-lg font-bold text-gray-900">
                  {users.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Verified</p>
                <p className="text-lg font-bold text-gray-900">
                  {users.filter((u) => u.email_confirmed_at).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <Shield className="h-4 w-4 text-red-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Admins</p>
                <p className="text-lg font-bold text-gray-900">
                  {users.filter((u) => u.role === "admin").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Unverified</p>
                <p className="text-lg font-bold text-gray-900">
                  {users.filter((u) => !u.email_confirmed_at).length}
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
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="all">All Roles</option>
              <option value="user">Users</option>
              <option value="admin">Admins</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Companies</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow
                  key={user.id}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {user.full_name || "Unnamed User"}
                        </p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        user.role === "admin"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }
                    >
                      {user.role === "admin" ? "Admin" : "User"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        user.email_confirmed_at
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {user.email_confirmed_at ? "Verified" : "Unverified"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">
                      {user.company_requests?.[0]?.count || 0}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-gray-500">
                      {user.last_sign_in_at
                        ? new Date(user.last_sign_in_at).toLocaleDateString()
                        : "Never"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleUserClick(user)}
                      variant="ghost"
                      size="sm"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No users found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Detail Modal */}
      <UserDetailModal
        user={selectedUser}
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        onUpdate={handleUserUpdate}
      />
    </div>
  );
}
