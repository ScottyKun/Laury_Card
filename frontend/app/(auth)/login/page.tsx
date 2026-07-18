"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AuthPanel from "@/components/authPanel";
import AuthToggle from "@/components/authToggle";
import { loginUser } from "@/lib/api";
import { setToken } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const searchParams = useSearchParams();
  const expired = searchParams.get("expired");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { token } = await loginUser({ email, password });
      setToken(token);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <AuthPanel />

      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-1/2">
        <div className="mx-auto w-full max-w-sm">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-dark/60 hover:text-dark"
          >
            ← Retour
          </Link>
          <AuthToggle />

          <h2 className="mt-8 font-serif text-3xl">Bon retour !</h2>
          <p className="mt-2 text-dark/60">
            Connectez-vous pour retrouver vos créations.
          </p>

          {expired && (
            <p className="mb-4 rounded-lg bg-coral/10 px-4 py-2 text-sm text-coral-dark">
              Votre session a expiré, reconnectez-vous.
            </p>
          )}
          
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
                Adresse e-mail
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="marie@exemple.com"
                className="w-full rounded-xl border border-dark/10 px-4 py-3 text-sm outline-none focus:border-coral"
              />
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">
                  Mot de passe
                </label>
                <Link href="/forgot-password" className="text-sm text-coral hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-dark/10 px-4 py-3 text-sm outline-none focus:border-coral"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-dark/40 hover:text-dark"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-coral py-3 font-medium text-white transition hover:bg-coral-dark disabled:opacity-60"
            >
              {loading ? "Connexion..." : "Se connecter →"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-dark/60">
            Pas encore de compte ?{" "}
            <Link href="/register" className="text-coral hover:underline">
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}