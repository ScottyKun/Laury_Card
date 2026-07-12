"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreVertical, Copy, Trash2 } from "lucide-react";
import { CardSummary } from "@/lib/api";
import { timeAgo } from "@/lib/time";

const fallbackGradients = [
  "from-stone-300 to-stone-200",
  "from-sky-300 to-sky-200",
  "from-violet-300 to-violet-200",
  "from-rose-300 to-rose-200",
];

type Props = {
  card: CardSummary;
  index: number;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
};

export default function CardTile({ card, index, onDelete, onDuplicate }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const gradient = fallbackGradients[index % fallbackGradients.length];

  return (
    <div className="group flex flex-col gap-2">
      <div className="relative">
        <Link href={`/create?id=${card.id}`}>
          <div
            style={{ aspectRatio: `${card.width_px} / ${card.height_px}` }}
            className={`w-full overflow-hidden rounded-xl shadow-sm transition group-hover:shadow-md ${
                !card.thumbnail_url ? `bg-gradient-to-br ${gradient}` : ""
            }`}
            >
            {card.thumbnail_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={`${card.thumbnail_url}?v=${encodeURIComponent(card.updated_at)}`}
                alt={card.title}
                className="h-full w-full object-cover"
              />
            )}
          </div>
        </Link>

        <div className="absolute right-2 top-2">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/80 text-dark/70 opacity-0 backdrop-blur transition group-hover:opacity-100 hover:bg-white"
          >
            <MoreVertical size={16} />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-9 z-10 w-40 rounded-lg border border-dark/10 bg-white py-1 shadow-lg">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDuplicate(card.id);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-cream-dark"
              >
                <Copy size={14} /> Dupliquer
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(card.id);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50"
              >
                <Trash2 size={14} /> Supprimer
              </button>
            </div>
          )}
        </div>
      </div>

      <div>
        <p className="truncate text-sm font-medium">{card.title}</p>
        <p className="text-xs text-dark/50">{timeAgo(card.updated_at)}</p>
      </div>
    </div>
  );
}