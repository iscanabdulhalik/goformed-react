// src/pages/admin/AdminCompanyManagement.jsx - Company Management (Placeholder)
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building, Plus, Search, Filter } from "lucide-react";

export default function AdminCompanyManagement() {
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
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button size="sm" className="bg-red-600 hover:bg-red-700">
            <Search className="h-4 w-4 mr-2" />
            Advanced Search
          </Button>
        </div>
      </div>

      {/* Coming Soon Card */}
      <Card className="border-dashed border-2 border-gray-300">
        <CardContent className="p-12 text-center">
          <Building className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Company Management Coming Soon
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            This feature will allow you to review company formation requests,
            approve applications, and manage the entire company lifecycle.
          </p>
          <div className="space-y-2 text-sm text-gray-500">
            <p>✅ Review company applications</p>
            <p>✅ Document verification</p>
            <p>✅ Status management</p>
            <p>✅ Automated workflows</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
