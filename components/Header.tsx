"use client";
import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import { useAuth } from "@/lib/hooks/use-auth";
import { useEffect, useState } from "react";

export default function Header() {
  const { isAuthenticated, logout } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Return a simple placeholder during server rendering
  if (!mounted) {
    return (
      <header className="border-b">
        <div className="container mx-auto py-4 px-4 flex items-center">
          <Link href="/" className="font-bold text-xl mr-8">
            MovieCritic
          </Link>
          <div className="flex-1 max-w-md ml-auto">
            <SearchBar />
          </div>
        </div>
      </header>
    );
  }

  // Full component after client-side hydration
  return (
    <header className="border-b">
      <div className="container mx-auto py-4 px-4 flex items-center">
        <Link href="/" className="font-bold text-xl mr-8">
          MovieCritic
        </Link>
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
        <div className="flex-1 max-w-md ml-auto">
          <SearchBar />
        </div>
      </div>
    </header>
  );
}
