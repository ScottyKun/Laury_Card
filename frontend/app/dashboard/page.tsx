"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Image as ImageIcon, BookOpen } from "lucide-react";
import DashboardNavbar from "@/components/dashboard/dashboardNavbar";
import GreetingBanner from "@/components/dashboard/greetingBanner";
import CardTile from "@/components/dashboard/cardTile";
import { getCards, getCurrentUser, deleteCardApi, CardSummary, duplicateCardApi } from "@/lib/api";

export default function DashboardPage() {
  const [firstName, setFirstName] = useState<string>();
  const [cards, setCards] = useState<CardSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"cards" | "books">("cards");

  useEffect(() => {
    async function load() {
      try {
        const [user, cardList] = await Promise.all([getCurrentUser(), getCards()]);
        setFirstName(user.first_name);
        setCards(cardList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleDelete(id: string) {
    if (!confirm("Supprimer cette carte définitivement ?")) return;
    try {
      await deleteCardApi(id);
      setCards((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression");
    }
  }

  async function handleDuplicate(id: string) {
    try {
      const newCard = await duplicateCardApi(id);
      setCards((prev) => [newCard, ...prev]);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la duplication");
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <DashboardNavbar firstName={firstName} />
      <GreetingBanner firstName={firstName} />

      <div className="px-6 pt-8">
        <div className="flex gap-6 border-b border-dark/10">
          <button
            onClick={() => setTab("cards")}
            className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-medium ${
              tab === "cards" ? "border-coral text-coral" : "border-transparent text-dark/50"
            }`}
          >
            <ImageIcon size={16} /> Mes Cartes
          </button>
          <button
            onClick={() => setTab("books")}
            className={`flex items-center gap-2 border-b-2 pb-3 text-sm font-medium ${
              tab === "books" ? "border-coral text-coral" : "border-transparent text-dark/50"
            }`}
          >
            <BookOpen size={16} /> Mes Livres
          </button>
        </div>

        {tab === "cards" ? (
          loading ? (
            <p className="py-10 text-center text-dark/40">Chargement...</p>
          ) : (
            <div className="grid grid-cols-2 gap-6 py-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              <Link
                href="/create"
                className="flex aspect-[3/4] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-dark/15 text-dark/50 hover:border-coral hover:text-coral"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-dark/5">
                  <Plus size={18} />
                </span>
                Créer une carte
              </Link>

              {cards.map((card, i) => (
                <CardTile key={card.id} card={card} index={i} onDelete={handleDelete} onDuplicate={handleDuplicate} />
              ))}
            </div>
          )
        ) : (
          <p className="py-10 text-center text-dark/40">
            Les livres arrivent au Sprint 4 📖
          </p>
        )}
      </div>
    </div>
  );
}