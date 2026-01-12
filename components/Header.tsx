"use client";

import Link from "next/link";
import { useAuth } from "@/lib/hooks/use-auth";
import SearchBar from "@/components/SearchBar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Film, User, LogOut, LogIn } from "lucide-react";

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <header className="border-b">
      <div className="container mx-auto py-4 px-4 flex items-center">
        <Link href="/" className="font-bold text-xl mr-8">
          MovieCritic
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <SearchBar />

          <Button variant="ghost" size="icon" className="h-9 w-9" asChild>
            <Link href="/movies" aria-label="Browse movies">
              <Film className="h-5 w-5" />
            </Link>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                aria-label="User menu"
              >
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {isAuthenticated ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      {user?.name || "Profile"}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem asChild>
                  <Link href="/login" className="cursor-pointer">
                    <LogIn className="mr-2 h-4 w-4" />
                    Login
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
