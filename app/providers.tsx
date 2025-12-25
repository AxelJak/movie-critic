"use client";

import { AuthProvider } from "@/lib/hooks/use-auth";
import SessionTimeoutWarning from "@/components/SessionTimeoutWarning";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SessionTimeoutWarning />
      {children}
    </AuthProvider>
  );
}