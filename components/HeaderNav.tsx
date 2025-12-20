"use client";

import Link from "next/link";
import { useAuth } from "@/lib/hooks/use-auth";

export default function HeaderNav() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <nav className="hidden md:flex items-center space-x-6 mr-6">
      <Link href="/movies" className="hover:text-primary">
        Movies
      </Link>
      {isAuthenticated ? (
        <>
          <Link href="/profile" className="hover:text-primary">
            My Profile
          </Link>
          <button onClick={() => logout()} className="hover:text-primary">
            Logout
          </button>
        </>
      ) : (
        <Link href="/login" className="hover:text-primary">
          Login
        </Link>
      )}
    </nav>
  );
}
