"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/hooks/use-auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SessionTimeoutWarningProps {
  warningTime?: number; // Time before expiration to show warning (in minutes)
  sessionDuration?: number; // Total session duration (in minutes)
}

export default function SessionTimeoutWarning({
  warningTime = 5,
  sessionDuration = 1440, // 24 hours by default
}: SessionTimeoutWarningProps) {
  const { isAuthenticated, logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowWarning(false);
      return;
    }

    // Get last activity time from localStorage
    const lastActivity = localStorage.getItem("lastActivity");
    const rememberMe = localStorage.getItem("rememberMe") === "true";

    // Adjust session duration based on remember me
    const effectiveDuration = rememberMe ? 43200 : sessionDuration; // 30 days or default
    const warningTimeMs = warningTime * 60 * 1000;
    const sessionDurationMs = effectiveDuration * 60 * 1000;

    const checkSessionTimeout = () => {
      const now = Date.now();
      const lastActivityTime = lastActivity ? parseInt(lastActivity) : now;
      const elapsed = now - lastActivityTime;
      const remaining = sessionDurationMs - elapsed;

      // Show warning if less than warningTime minutes remaining
      if (remaining > 0 && remaining <= warningTimeMs) {
        setShowWarning(true);
        setTimeRemaining(Math.floor(remaining / 60000)); // Convert to minutes
      } else if (remaining <= 0) {
        // Session expired, logout user
        logout();
      } else {
        setShowWarning(false);
      }
    };

    // Check immediately
    checkSessionTimeout();

    // Check every minute
    const interval = setInterval(checkSessionTimeout, 60000);

    return () => clearInterval(interval);
  }, [isAuthenticated, logout, warningTime, sessionDuration]);

  const handleExtendSession = () => {
    // Update last activity time
    localStorage.setItem("lastActivity", Date.now().toString());
    setShowWarning(false);
  };

  const handleLogout = () => {
    logout();
  };

  if (!showWarning) return null;

  return (
    <Dialog open={showWarning} onOpenChange={setShowWarning}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Session Expiring Soon</DialogTitle>
          <DialogDescription>
            Your session will expire in {timeRemaining} minute
            {timeRemaining !== 1 ? "s" : ""}. Would you like to extend your
            session?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={handleLogout}>
            Logout Now
          </Button>
          <Button onClick={handleExtendSession}>Extend Session</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
