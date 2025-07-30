// src/pages/admin/AdminDashboardPage.jsx - With Recharts
import React, { useState, useEffect } from "react";
import { supabase } from "@/supabase";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Building,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Globe,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  MessageSquare,
  Settings,
  Calendar,
  Shield,
  Bell,
  FileText,
} from "lucide-react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

// Mock data for charts
const registrationData = [
  { month: "Jan", users: 45, companies: 23 },
  { month: "Feb", users: 78, companies: 41 },
  { month: "Mar", users: 123, companies: 67 },
  { month: "Apr", users: 156, companies: 89 },
  { month: "May", users: 189, companies: 112 },
  { month: "Jun", users: 234, companies: 145 },
];

const revenueData = [
  { month: "Jan", revenue: 12400 },
  { month: "Feb", revenue: 18900 },
  { month: "Mar", revenue: 25600 },
  { month: "Apr", revenue: 31200 },
  { month: "May", revenue: 28900 },
  { month: "Jun", revenue: 42100 },
];

const statusData = [
  { name: "Completed", value: 65, color: "#10B981" },
  { name: "In Review", value: 20, color: "#3B82F6" },
  { name: "Pending", value: 12, color: "#F59E0B" },
  { name: "Rejected", value: 3, color: "#EF4444" },
];

const countryData = [
  { country: "United States", users: 1247, flag: "🇺🇸" },
  { country: "United Kingdom", users: 892, flag: "🇬🇧" },
  { country: "Germany", users: 634, flag: "🇩🇪" },
  { country: "France", users: 423, flag: "🇫🇷" },
  { country: "Canada", users: 312, flag: "🇨🇦" },
];

const performanceData = [
  { name: "Conversion Rate", value: 4.2, target: 5.0 },
  { name: "Processing Time", value: 2.3, target: 2.0 },
  { name: "Satisfaction", value: 4.8, target: 4.5 },
  { name: "Resolution Rate", value: 94.2, target: 95.0 },
];

// Recent Activity Component
const RecentActivity = ({ activities }) => (
  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-base">
        <Activity className="h-4 w-4 text-red-600" />
        Recent Activity
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className={`p-2 rounded-lg ${activity.bgColor}`}>
              <activity.icon className={`h-4 w-4 ${activity.iconColor}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                {activity.title}
              </p>
              <p className="text-xs text-gray-500">{activity.description}</p>
            </div>
            <span className="text-xs text-gray-400">{activity.time}</span>
          </motion.div>
        ))}
      </div>
    </CardContent>
  </Card>
);

// Stats Card Component
const StatsCard = ({ title, value, change, changeType, icon: Icon, color }) => (
  <motion.div variants={itemVariants} whileHover={{ scale: 1.02, y: -2 }}>
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {change && (
              <div className="flex items-center mt-2">
                {changeType === "up" ? (
                  <ArrowUpRight className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <ArrowDownRight className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span
                  className={`text-xs font-medium ${
                    changeType === "up" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {change}
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  vs last month
                </span>
              </div>
            )}
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

// Custom Tooltip Components
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const RevenueTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-red-600">
          Revenue: £{payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCompanies: 0,
    completedCompanies: 0,
    pendingCompanies: 0,
    totalRevenue: 0,
    newUsersToday: 0,
  });
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch user count
        const { count: userCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true });

        // Fetch today's new users
        const today = new Date().toISOString().split("T")[0];
        const { count: newUsersCount } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .gte("created_at", today);

        // Fetch company requests
        const { data: companies, count: companyCount } = await supabase
          .from("company_requests")
          .select("*", { count: "exact" });

        const completedCount =
          companies?.filter((c) => c.status === "completed").length || 0;
        const pendingCount =
          companies?.filter((c) => c.status !== "completed").length || 0;

        setStats({
          totalUsers: userCount || 0,
          totalCompanies: companyCount || 0,
          completedCompanies: completedCount,
          pendingCompanies: pendingCount,
          totalRevenue: 145600, // Mock data
          newUsersToday: newUsersCount || 0,
        });

        // Set recent activities
        setRecentActivities([
          {
            title: "New user registered",
            description: "john.doe@example.com joined the platform",
            time: "2m ago",
            icon: Users,
            bgColor: "bg-blue-100",
            iconColor: "text-blue-600",
          },
          {
            title: "Company formation completed",
            description: "AVALON CONSULTING LTD has been approved",
            time: "15m ago",
            icon: CheckCircle,
            bgColor: "bg-green-100",
            iconColor: "text-green-600",
          },
          {
            title: "Payment received",
            description: "£249 payment for Pro Builder package",
            time: "1h ago",
            icon: DollarSign,
            bgColor: "bg-yellow-100",
            iconColor: "text-yellow-600",
          },
          {
            title: "Document uploaded",
            description: "User uploaded identity verification",
            time: "2h ago",
            icon: AlertTriangle,
            bgColor: "bg-orange-100",
            iconColor: "text-orange-600",
          },
        ]);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();

    // Set up real-time subscriptions
    const channel = supabase
      .channel("admin_dashboard_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "company_requests" },
        () => {
          fetchDashboardData();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Header */}
      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-6 relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-24 h-24 bg-red-200 rounded-full blur-2xl"></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 bg-orange-200 rounded-full blur-2xl"></div>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome to Admin Dashboard
            </h1>
            <p className="text-gray-600 text-sm">
              Monitor your platform's performance and manage users efficiently
            </p>
            <div className="flex items-center gap-4 mt-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-600">System Online</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3 text-gray-500" />
                <span className="text-xs text-gray-600">
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/notifications">
                <MessageSquare className="h-4 w-4 mr-2" />
                Send Notification
              </Link>
            </Button>
            <Button asChild size="sm" className="bg-red-600 hover:bg-red-700">
              <Link to="/admin/users">
                <Users className="h-4 w-4 mr-2" />
                Manage Users
              </Link>
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
      >
        <StatsCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          change="+12.5%"
          changeType="up"
          icon={Users}
          color="bg-blue-500"
        />
        <StatsCard
          title="Total Companies"
          value={stats.totalCompanies.toLocaleString()}
          change="+8.2%"
          changeType="up"
          icon={Building}
          color="bg-green-500"
        />
        <StatsCard
          title="Completed"
          value={stats.completedCompanies.toLocaleString()}
          change="+15.3%"
          changeType="up"
          icon={CheckCircle}
          color="bg-emerald-500"
        />
        <StatsCard
          title="Pending"
          value={stats.pendingCompanies.toLocaleString()}
          change="-5.1%"
          changeType="down"
          icon={Clock}
          color="bg-orange-500"
        />
        <StatsCard
          title="Revenue"
          value={`£${stats.totalRevenue.toLocaleString()}`}
          change="+23.1%"
          changeType="up"
          icon={DollarSign}
          color="bg-purple-500"
        />
      </motion.div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User & Company Registration Chart */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-red-600" />
                Registration Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={registrationData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                  />
                  <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stackId="1"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.6}
                    name="Users"
                  />
                  <Area
                    type="monotone"
                    dataKey="companies"
                    stackId="1"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.6}
                    name="Companies"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Revenue Chart */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="h-4 w-4 text-red-600" />
                Revenue Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                  />
                  <YAxis tick={{ fontSize: 12 }} stroke="#6b7280" />
                  <Tooltip content={<RevenueTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#EF4444"
                    strokeWidth={3}
                    dot={{ fill: "#EF4444", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#EF4444", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Status Distribution & Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Status Distribution */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Building className="h-4 w-4 text-red-600" />
                Company Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value}%`, "Percentage"]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {statusData.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Top Countries */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Globe className="h-4 w-4 text-red-600" />
                Top Countries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {countryData.map((country, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">{country.flag}</span>
                      <span className="text-sm font-medium text-gray-900">
                        {country.country}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-700">
                        {country.users.toLocaleString()}
                      </span>
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-600 h-2 rounded-full transition-all duration-500"
                          style={{
                            width: `${
                              (country.users / countryData[0].users) * 100
                            }%`,
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Performance Metrics Chart */}
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="h-4 w-4 text-red-600" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={performanceData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    stroke="#6b7280"
                    width={80}
                  />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3B82F6" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="target" fill="#E5E7EB" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div variants={itemVariants}>
        <RecentActivity activities={recentActivities} />
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Settings className="h-4 w-4 text-red-600" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button
                asChild
                variant="outline"
                className="h-auto p-4 flex-col hover:bg-blue-50"
              >
                <Link to="/admin/users">
                  <Users className="h-6 w-6 mb-2 text-blue-600" />
                  <span className="font-medium">Manage Users</span>
                  <span className="text-xs text-gray-500 mt-1 text-center">
                    View and edit user accounts
                  </span>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-auto p-4 flex-col hover:bg-green-50"
              >
                <Link to="/admin/companies">
                  <Building className="h-6 w-6 mb-2 text-green-600" />
                  <span className="font-medium">Review Companies</span>
                  <span className="text-xs text-gray-500 mt-1 text-center">
                    Process company applications
                  </span>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-auto p-4 flex-col hover:bg-purple-50"
              >
                <Link to="/admin/notifications">
                  <MessageSquare className="h-6 w-6 mb-2 text-purple-600" />
                  <span className="font-medium">Send Notifications</span>
                  <span className="text-xs text-gray-500 mt-1 text-center">
                    Notify users and groups
                  </span>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="h-auto p-4 flex-col hover:bg-orange-50"
              >
                <Link to="/admin/reports">
                  <TrendingUp className="h-6 w-6 mb-2 text-orange-600" />
                  <span className="font-medium">View Reports</span>
                  <span className="text-xs text-gray-500 mt-1 text-center">
                    Analytics and insights
                  </span>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* System Status Footer */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-gray-50 to-gray-100">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-600">
                    System Status: All Services Operational
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-blue-500" />
                  <span className="text-sm text-gray-600">
                    {stats.newUsersToday} new users today
                  </span>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
