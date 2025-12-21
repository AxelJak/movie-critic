import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import HeaderNav from "@/components/HeaderNav";
import { Button } from "@/components/ui/button";
import { User } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto py-4 px-4 flex items-center">
        <Link href="/" className="font-bold text-xl mr-8">
          MovieCritic
        </Link>
        <HeaderNav />
        <div className="ml-auto flex items-center gap-2">
          <SearchBar />
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            aria-label="User profile"
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
