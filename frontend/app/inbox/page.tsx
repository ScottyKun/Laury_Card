"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail } from "lucide-react";
import { getInbox, markShareReadApi, ShareItem } from "@/lib/api";
import { timeAgo } from "@/lib/time";

export default function InboxPage() {
  const router = useRouter();
  const [shares, setShares] = useState<ShareItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInbox().then(setShares).catch(console.error).finally(() => setLoading(false));
  }, []);

  async function handleOpen(share: ShareItem) {
    if (share.status === "unread") {
      await markShareReadApi(share.id);
      setShares((prev) => prev.map((s) => (s.id === share.id ? { ...s, status: "read" } : s)));
    }
    if (share.card_id) router.push(`/create?id=${share.card_id}`);
    if (share.book_id) router.push(`/books/${share.book_id}`);
  }

  return (
    <div className="min-h-screen bg-cream">
      <header className="flex h-16 items-center gap-4 border-b border-dark/10 bg-white px-6">
        <button onClick={() => router.push("/dashboard")} className="rounded-lg p-2 text-dark/60 hover:bg-cream">
          <ArrowLeft size={20} />
        </button>
        <h1 className="font-serif text-xl">Boîte de réception</h1>
      </header>

      <div className="mx-auto max-w-2xl px-6 py-8">
        {loading ? (
          <p className="text-center text-dark/40">Chargement...</p>
        ) : shares.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center text-dark/40">
            <Mail size={32} />
            <p>Aucun partage reçu pour l&apos;instant.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {shares.map((share) => {
              const title = share.card_title || share.book_title || "Sans titre";
              const thumbnail = share.card_thumbnail_url || share.book_thumbnail_url;
              const type = share.card_id ? "Carte" : "Livre";

              return (
                <button
                  key={share.id}
                  onClick={() => handleOpen(share)}
                  className={`flex items-center gap-4 rounded-xl border p-3 text-left transition hover:bg-white ${
                    share.status === "unread" ? "border-coral/30 bg-coral/5" : "border-dark/10 bg-white"
                  }`}
                >
                  <div
                    style={{
                      aspectRatio: share.card_width_px ? `${share.card_width_px} / ${share.card_height_px}` : "3 / 4",
                    }}
                    className="h-16 overflow-hidden rounded-lg bg-cream-dark"
                  >
                    {thumbnail && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={thumbnail} alt={title} className="h-full w-full object-cover" />
                    )}
                  </div>

                  <div className="flex-1">
                    <p className="text-sm font-medium">{title}</p>
                    <p className="text-xs text-dark/50">
                      {type} · De {share.sender_first_name} · {timeAgo(share.created_at)}
                    </p>
                  </div>

                  {share.status === "unread" && <span className="h-2 w-2 rounded-full bg-coral" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}