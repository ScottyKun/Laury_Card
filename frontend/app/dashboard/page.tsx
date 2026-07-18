"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Image as ImageIcon, BookOpen } from "lucide-react";
import DashboardNavbar from "@/components/dashboard/dashboardNavbar";
import GreetingBanner from "@/components/dashboard/greetingBanner";
import CardTile from "@/components/dashboard/cardTile";
import { getCards, getCurrentUser, deleteCardApi, CardSummary, duplicateCardApi, getBooks, createBookApi, deleteBookApi, Book, getUnreadNotificationCount, duplicateBookApi  } from "@/lib/api";
import { useRouter } from "next/navigation";
import BookTile from "@/components/dashboard/bookTile";
import { subscribeToPush } from "@/lib/push";


export default function DashboardPage() {
  const [firstName, setFirstName] = useState<string>();
  const [cards, setCards] = useState<CardSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"cards" | "books">("cards");
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [booksLoading, setBooksLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [pushWarning, setPushWarning] = useState<string | null>(null);
  const [pushWarningDismissed, setPushWarningDismissed] = useState(false);
  const handleNewNotification = useCallback(() => {
    setUnreadCount((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) return;
    subscribeToPush(vapidKey).then((result) => {
      if (!result.success) setPushWarning(result.reason || "Notifications système indisponibles.");
    });
  }, []);

  useEffect(() => {
    async function load() {
      try {
        const [user, cardList, count] = await Promise.all([getCurrentUser(), getCards(), getUnreadNotificationCount()]);
        setFirstName(user.first_name);
        setCards(cardList);
        setUnreadCount(count);
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

  useEffect(() => {
    if (tab !== "books") return;
    getBooks().then(setBooks).catch(console.error).finally(() => setBooksLoading(false));
  }, [tab]);

  async function handleCreateBook() {
    try {
      const book = await createBookApi();
      router.push(`/books/${book.id}`);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la création du livre");
    }
  }

  async function handleDeleteBook(id: string) {
    if (!confirm("Supprimer ce livre définitivement ?")) return;
    try {
      await deleteBookApi(id);
      setBooks((prev) => prev.filter((b) => b.id !== id));
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression");
    }
  }

  async function handleDuplicateBook(id: string) {
    try {
      const newBook = await duplicateBookApi(id);
      setBooks((prev) => [newBook, ...prev]);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la duplication");
    }
  }

  return (
    <div className="min-h-screen bg-cream">
      <DashboardNavbar firstName={firstName} unreadCount={unreadCount} onNewNotification={handleNewNotification}/>
      <GreetingBanner firstName={firstName} onCreateBook={handleCreateBook}/>

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

              {cards.map((card, i) => (
                <CardTile key={card.id} card={card} index={i} onDelete={handleDelete} onDuplicate={handleDuplicate} />
              ))}
            </div>
          )
        ) : (
          <div className="grid grid-cols-2 gap-6 py-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {books.map((book) => (
              <BookTile key={book.id} book={book} onDelete={handleDeleteBook} onDuplicate={handleDuplicateBook} />
            ))}
          </div>
        )}
      </div>
      {pushWarning && !pushWarningDismissed && (
        <div className="mx-6 mt-4 flex items-center justify-between rounded-lg bg-dark/5 px-4 py-2.5 text-xs text-dark/60">
          <span>ℹ️ {pushWarning} Vous recevrez toujours vos notifications dans l&apos;app.</span>
          <button onClick={() => setPushWarningDismissed(true)} className="ml-3 font-medium hover:text-dark">
            Ignorer
          </button>
        </div>
      )}
    </div>
  );
}