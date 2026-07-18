"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Lock, Heart, Trash2  } from "lucide-react";
import AuthPanel from "@/components/authPanel";
import { getCurrentUser, updateProfile, changePassword, createMilestoneApi, getMilestones, deleteMilestoneApi, Milestone } from "@/lib/api";

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

  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [newLabel, setNewLabel] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newFrequency, setNewFrequency] = useState<"monthly" | "bimonthly">("monthly");
  const [newDay, setNewDay] = useState(1);

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

  useEffect(() => {
    getMilestones().then(setMilestones).catch(console.error);
  }, []);

  async function handleAddMilestone(e: React.FormEvent) {
    e.preventDefault();
    try {
      const milestone = await createMilestoneApi({
        label: newLabel, startDate: newStartDate, minorFrequency: newFrequency, minorDay: newDay,
      });
      setMilestones((prev) => [...prev, milestone]);
      setNewLabel(""); setNewStartDate("");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erreur");
    }
  }

  async function handleDeleteMilestone(id: string) {
    await deleteMilestoneApi(id);
    setMilestones((prev) => prev.filter((m) => m.id !== id));
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
          {/* Jalons */}
          <div className="mt-10 border-t border-dark/10 pt-8">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-dark/70">
              <Heart size={16} className="text-coral" /> Jalons & anniversaires
            </div>

            <div className="mb-4 flex flex-col gap-2">
              {milestones.map((m) => (
                <div key={m.id} className="flex items-center justify-between rounded-lg border border-dark/10 px-4 py-2.5 text-sm">
                  <span>{m.label} — depuis le {new Date(m.start_date).toLocaleDateString("fr-FR")}</span>
                  <button onClick={() => handleDeleteMilestone(m.id)} className="text-dark/40 hover:text-red-500">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddMilestone} className="flex flex-col gap-3 rounded-lg bg-cream-dark p-4">
              <input
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="Nom (ex: Relation, Fiançailles)"
                required
                className="rounded-lg border border-dark/10 px-3 py-2 text-sm"
              />
              <input
                type="date"
                value={newStartDate}
                onChange={(e) => setNewStartDate(e.target.value)}
                required
                className="rounded-lg border border-dark/10 px-3 py-2 text-sm"
              />
              <div className="flex gap-2">
                <select value={newFrequency} onChange={(e) => setNewFrequency(e.target.value as "monthly" | "bimonthly")} className="flex-1 rounded-lg border border-dark/10 px-3 py-2 text-sm">
                  <option value="monthly">Rappel mensuel</option>
                  <option value="bimonthly">Rappel tous les 2 mois</option>
                </select>
                <input
                  type="number"
                  min={1}
                  max={28}
                  value={newDay}
                  onChange={(e) => setNewDay(Number(e.target.value))}
                  className="w-20 rounded-lg border border-dark/10 px-3 py-2 text-sm"
                />
              </div>
              <button type="submit" className="rounded-full bg-coral py-2 text-sm font-medium text-white hover:bg-coral-dark">
                Ajouter ce jalon
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}