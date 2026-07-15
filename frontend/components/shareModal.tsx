"use client";

import { useState } from "react";
import { X, Send } from "lucide-react";
import { shareItem } from "@/lib/api";

type Props = {
  cardId?: string;
  bookId?: string;
  onClose: () => void;
};

export default function ShareModal({ cardId, bookId, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    setMessage(null);
    try {
      await shareItem({ recipientEmail: email, cardId, bookId });
      setMessage({ type: "success", text: `Partagé avec ${email} !` });
      setEmail("");
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Erreur" });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-dark/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-xl">Partager</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-dark/40 hover:bg-cream-dark hover:text-dark">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Email du destinataire</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="marie@exemple.com"
              className="w-full rounded-xl border border-dark/10 px-4 py-2.5 text-sm outline-none focus:border-coral"
            />
            <p className="mt-1.5 text-xs text-dark/40">
              La personne doit déjà avoir un compte Cartes&amp;Mots.
            </p>
          </div>

          {message && (
            <p className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-500"}`}>
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={sending}
            className="flex items-center justify-center gap-2 rounded-full bg-coral py-2.5 text-sm font-medium text-white hover:bg-coral-dark disabled:opacity-60"
          >
            <Send size={16} /> {sending ? "Envoi..." : "Envoyer"}
          </button>
        </form>
      </div>
    </div>
  );
}