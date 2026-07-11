"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AuthPanel from "@/components/authPanel";
import AuthToggle from "@/components/authToggle";
import { registerUser } from "@/lib/api";
import { setToken } from "@/lib/auth";

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score; // 0 à 4
}

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(password);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { token } = await registerUser({ firstName, email, password });
      setToken(token);
      router.push("/");
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

          <h2 className="mt-8 font-serif text-3xl">Créez votre compte</h2>
          <p className="mt-2 text-dark/60">
            Rejoignez Cartes&Mots et commencez à créer.
          </p>

          <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
            <div>
              <label htmlFor="firstName" className="mb-1.5 block text-sm font-medium">
                Prénom
              </label>
              <input
                id="firstName"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Marie"
                className="w-full rounded-xl border border-dark/10 px-4 py-3 text-sm outline-none focus:border-coral"
              />
            </div>

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
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 8 caractères"
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

              {/* Barre de force du mot de passe */}
              <div className="mt-2 flex gap-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition-colors ${
                      i < strength ? "bg-coral" : "bg-dark/10"
                    }`}
                  />
                ))}
              </div>
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-coral py-3 font-medium text-white transition hover:bg-coral-dark disabled:opacity-60"
            >
              {loading ? "Création..." : "Créer mon compte →"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-dark/60">
            Déjà un compte ?{" "}
            <Link href="/login" className="text-coral hover:underline">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}