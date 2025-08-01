import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { AUTH_CONFIG } from "@/config/auth";

export default function SessionWarningModal() {
  const {
    showSessionWarning,
    sessionTimeLeft,
    extendSession,
    handleSessionExpired,
  } = useAuth();

  if (!showSessionWarning) return null;

  // Progress bar'ın yüzdesini hesapla
  const progressPercentage =
    (sessionTimeLeft / (AUTH_CONFIG.SESSION.WARNING_TIME / 60000)) * 100;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <Card className="w-full max-w-md shadow-2xl border-yellow-500/50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 p-2 bg-yellow-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <CardTitle className="text-xl">Session Expiring Soon</CardTitle>
                <CardDescription className="mt-1">
                  You will be logged out due to inactivity.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-700 text-center">
              Your session will expire in approximately{" "}
              <strong className="text-yellow-700 font-bold">
                {sessionTimeLeft} minute{sessionTimeLeft > 1 ? "s" : ""}
              </strong>
              .
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-yellow-500 h-2.5 rounded-full transition-all duration-1000 ease-linear"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-3 pt-4">
            <Button onClick={handleSessionExpired} variant="outline">
              Log Out
            </Button>
            <Button
              onClick={extendSession}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Stay Signed In
            </Button>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
