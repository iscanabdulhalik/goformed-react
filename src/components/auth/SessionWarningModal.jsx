// src/components/auth/SessionWarningModal.jsx - Session timeout warning
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const SessionWarningModal = () => {
  const { user, session, refreshSession, signOut } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  // Session expiry check
  const checkSessionExpiry = useCallback(() => {
    if (!session || !session.expires_at) return;

    const expiresAt = new Date(session.expires_at * 1000);
    const now = new Date();
    const timeUntilExpiry = expiresAt.getTime() - now.getTime();

    // Show warning 5 minutes before expiry
    const warningThreshold = 5 * 60 * 1000; // 5 minutes

    if (timeUntilExpiry <= warningThreshold && timeUntilExpiry > 0) {
      setTimeLeft(Math.floor(timeUntilExpiry / 1000));
      setShowWarning(true);
    } else if (timeUntilExpiry <= 0) {
      // Session expired
      handleSignOut();
    } else {
      setShowWarning(false);
    }
  }, [session]);

  // Handle session refresh
  const handleRefreshSession = async () => {
    try {
      const newSession = await refreshSession();
      if (newSession) {
        setShowWarning(false);
        setTimeLeft(0);
      }
    } catch (error) {
      console.error("Failed to refresh session:", error);
      handleSignOut();
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      setShowWarning(false);
      setTimeLeft(0);
    } catch (error) {
      console.error("Failed to sign out:", error);
    }
  };

  // Check session expiry every 30 seconds
  useEffect(() => {
    if (!user || !session) return;

    const interval = setInterval(checkSessionExpiry, 30000);

    // Check immediately
    checkSessionExpiry();

    return () => clearInterval(interval);
  }, [user, session, checkSessionExpiry]);

  // Update countdown timer
  useEffect(() => {
    if (!showWarning || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSignOut();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [showWarning, timeLeft]);

  // Format time display
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!showWarning || !user) return null;

  return (
    <Dialog open={showWarning} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" closeButton={false}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-yellow-500">⚠️</span>
            Session Expiring Soon
          </DialogTitle>
          <DialogDescription>
            Your session will expire in{" "}
            <span className="font-mono font-semibold text-destructive">
              {formatTime(timeLeft)}
            </span>
            . Would you like to extend your session?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex gap-2 sm:gap-2">
          <Button variant="outline" onClick={handleSignOut} className="flex-1">
            Sign Out
          </Button>
          <Button onClick={handleRefreshSession} className="flex-1">
            Extend Session
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SessionWarningModal;
