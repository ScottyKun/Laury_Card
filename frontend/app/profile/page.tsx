"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Lock } from "lucide-react";
import AuthPanel from "@/components/authPanel";
import { getCurrentUser, updateProfile, changePassword } from "@/lib/api";

export default function ProfilePage() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    getCurrentUser()
      .then((user) => {
        setFirstName(user.first_name || "");
        setEmail(user.email);
      })
      .catch(console.error);
  }, []);

  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setProfileMessage(null);
    setProfileSaving(true);
    try {
      await updateProfile({ firstName, email });
      setProfileMessage({ type: "success", text: "Informations mises à jour." });
    } catch (err) {
      setProfileMessage({ type: "error", text: err instanceof Error ? err.message : "Erreur" });
    } finally {
      setProfileSaving(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordMessage(null);

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: "error", text: "Les nouveaux mots de passe ne correspondent pas." });
      return;
    }

    setPasswordSaving(true);
    try {
      await changePassword({ currentPassword, newPassword });
      setPasswordMessage({ type: "success", text: "Mot de passe modifié avec succès." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordMessage({ type: "error", text: err instanceof Error ? err.message : "Erreur" });
    } finally {
      setPasswordSaving(false);
    }
  }

  return (
    <div className="flex min-h-screen">
      <AuthPanel />

      <div className="flex w-full flex-col px-6 py-12 sm:px-12 lg:w-1/2">
        <div className="mx-auto w-full max-w-sm">
          <Link
            href="/dashboard"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-dark/60 hover:text-dark"
          >
            ← Retour
          </Link>

          <h2 className="font-serif text-3xl">Mon profil</h2>
          <p className="mt-2 text-dark/60">Gérez vos informations et votre sécurité.</p>

          {/* Informations personnelles */}
          <div className="mt-8">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-dark/70">
              <User size={16} className="text-coral" /> Informations personnelles
            </div>

            <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Prénom</label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-dark/10 px-4 py-3 text-sm outline-none focus:border-coral"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Adresse e-mail</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-dark/10 px-4 py-3 text-sm outline-none focus:border-coral"
                />
              </div>

              {profileMessage && (
                <p className={`text-sm ${profileMessage.type === "success" ? "text-green-600" : "text-red-500"}`}>
                  {profileMessage.text}
                </p>
              )}

              <button
                type="submit"
                disabled={profileSaving}
                className="rounded-full bg-coral py-3 font-medium text-white transition hover:bg-coral-dark disabled:opacity-60"
              >
                {profileSaving ? "Enregistrement..." : "Enregistrer"}
              </button>
            </form>
          </div>

          {/* Mot de passe */}
          <div className="mt-10 border-t border-dark/10 pt-8">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-dark/70">
              <Lock size={16} className="text-coral" /> Mot de passe
            </div>

            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Mot de passe actuel</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-dark/10 px-4 py-3 text-sm outline-none focus:border-coral"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Nouveau mot de passe</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full rounded-xl border border-dark/10 px-4 py-3 text-sm outline-none focus:border-coral"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Confirmer le nouveau mot de passe</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full rounded-xl border border-dark/10 px-4 py-3 text-sm outline-none focus:border-coral"
                />
              </div>

              {passwordMessage && (
                <p className={`text-sm ${passwordMessage.type === "success" ? "text-green-600" : "text-red-500"}`}>
                  {passwordMessage.text}
                </p>
              )}

              <button
                type="submit"
                disabled={passwordSaving}
                className="rounded-full border border-dark/10 py-3 font-medium hover:bg-cream-dark disabled:opacity-60"
              >
                {passwordSaving ? "Modification..." : "Modifier le mot de passe"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}