"use client";

import Link from "next/link";
import { useAuth } from "@/lib/hooks/use-auth";

export default function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth();

  console.log(user);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div>
        You are not logged in
        <Link href="/login">Login</Link>
      </div>
    );
  }

  return <div>User</div>;
}
