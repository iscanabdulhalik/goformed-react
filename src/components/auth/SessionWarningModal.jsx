// src/components/auth/SessionWarningModal.jsx
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function SessionWarningModal() {
  const {
    showSessionWarning,
    sessionTimeLeft,
    extendSession,
    handleSessionExpired,
  } = useAuth();

  if (!showSessionWarning) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <CardTitle className="text-lg font-medium text-gray-900">
              Session Expiring Soon
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-700">
            Your session will expire in{" "}
            <strong className="text-yellow-600">
              {sessionTimeLeft} minute{sessionTimeLeft !== 1 ? "s" : ""}
            </strong>
            . Would you like to extend your session?
          </p>

          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-yellow-500 h-2 rounded-full transition-all duration-1000"
              style={{
                width: `${Math.max(0, (sessionTimeLeft / 5) * 100)}%`,
              }}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <Button
              onClick={handleSessionExpired}
              variant="outline"
              className="text-gray-700 hover:bg-gray-50"
            >
              Log Out Now
            </Button>
            <Button
              onClick={extendSession}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Extend Session
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
