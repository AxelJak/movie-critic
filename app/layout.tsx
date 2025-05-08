import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import SearchBar from "@/components/SearchBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Movie Critic",
  description: "Discover and review your favorite movies",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="border-b">
          <div className="container mx-auto py-4 px-4 flex items-center">
            <Link href="/" className="font-bold text-xl mr-8">
              MovieCritic
            </Link>
            <nav className="hidden md:flex items-center space-x-6 mr-6">
              <Link href="/movies" className="hover:text-primary">
                Movies
              </Link>
              <Link href="/login" className="hover:text-primary">
                Login
              </Link>
            </nav>
            <div className="flex-1 max-w-md ml-auto">
              <SearchBar />
            </div>
          </div>
        </header>
        <main>
          {children}
        </main>
      </body>
    </html>
  );
}
