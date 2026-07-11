import Link from "next/link";
import Logo from "./logo";

export default function Footer() {
  return (
    <footer className="w-full bg-dark px-6 py-6 md:px-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 text-sm text-white/70 md:flex-row md:justify-between">
        <div className="[&_span]:text-white">
          <Logo />
        </div>

        <p>© 2026 Cartes&Mots · Fait avec ♥</p>

        <div className="flex gap-6">
          <Link href="/privacy" className="hover:text-white">
            Confidentialité
          </Link>
          <Link href="/contact" className="hover:text-white">
            Contact
          </Link>
        </div>
      </div>
    </footer>
  );
}