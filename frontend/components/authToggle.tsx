"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AuthToggle() {
  const pathname = usePathname();
  const isLogin = pathname === "/login";

  return (
    <div className="flex rounded-full bg-cream-dark p-1">
      <Link
        href="/login"
        className={`flex-1 rounded-full px-6 py-2.5 text-center text-sm font-medium transition ${
          isLogin ? "bg-white shadow-sm" : "text-dark/50 hover:text-dark"
        }`}
      >
        Se connecter
      </Link>
      <Link
        href="/register"
        className={`flex-1 rounded-full px-6 py-2.5 text-center text-sm font-medium transition ${
          !isLogin ? "bg-white shadow-sm" : "text-dark/50 hover:text-dark"
        }`}
      >
        Créer un compte
      </Link>
    </div>
  );
}