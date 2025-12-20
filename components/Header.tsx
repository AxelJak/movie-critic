import Link from "next/link";
import SearchBar from "@/components/SearchBar";
import HeaderNav from "@/components/HeaderNav";

export default function Header() {
  return (
    <header className="border-b">
      <div className="container mx-auto py-4 px-4 flex items-center">
        <Link href="/" className="font-bold text-xl mr-8">
          MovieCritic
        </Link>
        <HeaderNav />
        <div className="flex-1 max-w-md ml-auto">
          <SearchBar />
        </div>
      </div>
    </header>
  );
}
