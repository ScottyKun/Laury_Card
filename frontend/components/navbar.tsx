import Link from "next/link";
import Logo from "./logo";

export default function Navbar() {
  return (
    <header className="w-full px-6 py-5 md:px-12">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <Logo />

        <div className="flex items-center gap-3 md:gap-6">
          <Link
            href="/login"
            className="hidden text-sm text-dark/80 hover:text-dark md:inline-block"
          >
            Se connecter
          </Link>
          <Link
            href="/create"
            className="rounded-full bg-coral px-5 py-2.5 text-sm font-medium text-white transition hover:bg-coral-dark"
          >
            Commencer →
          </Link>
        </div>
      </div>
    </header>
  );
}