"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, Heart, Sparkles } from "lucide-react";
import { getNotifications, markNotificationReadApi, NotificationItem } from "@/lib/api";
import { timeAgo } from "@/lib/time";

const iconByType = {
  share_card: Mail,
  share_book: Mail,
  milestone: Heart,
  nudge: Sparkles,
};

export default function InboxPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getNotifications().then(setNotifications).catch(console.error).finally(() => setLoading(false));
  }, []);

  async function handleOpen(notif: NotificationItem) {
    if (!notif.read) {
      await markNotificationReadApi(notif.id);
      setNotifications((prev) => prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n)));
    }
    if (notif.card_id) router.push(`/create?id=${notif.card_id}`);
    else if (notif.book_id) router.push(`/books/${notif.book_id}`);
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="flex h-16 items-center gap-4 border-b border-dark/10 bg-white px-6">
        <button onClick={() => router.push("/dashboard")} className="rounded-lg p-2 text-dark/60 hover:bg-cream">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-serif text-xl">Notifications</h1>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-8">
        {loading ? (
          <p className="text-center text-dark/40">Chargement...</p>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center text-dark/40">
            <Mail size={32} />
            <p>Aucune notification pour l&apos;instant.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {notifications.map((notif) => {
              const Icon = iconByType[notif.type];
              return (
                <div
                  key={notif.id}
                  onClick={() => handleOpen(notif)}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 transition hover:bg-cream-dark ${
                    notif.read ? "border-dark/10 bg-white" : "border-coral/30 bg-coral/5"
                  }`}
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-coral/10 text-coral">
                    <Icon size={16} />
                  </span>
                  <div className="flex-1">
                    <p className="text-sm">{notif.message}</p>
                    <p className="mt-0.5 text-xs text-dark/40">{timeAgo(notif.created_at)}</p>
                  </div>
                  {!notif.read && <span className="h-2 w-2 shrink-0 rounded-full bg-coral" />}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}