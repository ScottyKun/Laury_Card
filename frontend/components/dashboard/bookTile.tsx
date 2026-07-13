"use client";

import { useState } from "react";
import Link from "next/link";
import { MoreVertical, Trash2, BookOpen } from "lucide-react";
import { Book } from "@/lib/api";
import { timeAgo } from "@/lib/time";

type Props = {
  book: Book;
  onDelete: (id: string) => void;
};

export default function BookTile({ book, onDelete }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="group flex flex-col gap-2">
      <div className="relative">
        <Link href={`/books/${book.id}`}>
          <div
            style={{ aspectRatio: book.cover_width_px ? `${book.cover_width_px} / ${book.cover_height_px}` : "3 / 4" }}
            className="flex w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-dark to-dark-light shadow-sm transition group-hover:shadow-md"
          >
            {book.cover_thumbnail_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={`${book.cover_thumbnail_url}?v=${encodeURIComponent(book.updated_at)}`} alt={book.title} className="h-full w-full object-cover" />
            ) : (
              <BookOpen size={32} className="text-white/40" />
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
                onClick={() => { setMenuOpen(false); onDelete(book.id); }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-red-500 hover:bg-red-50"
              >
                <Trash2 size={14} /> Supprimer
              </button>
            </div>
          )}
        </div>
      </div>

      <div>
        <p className="truncate text-sm font-medium">{book.title}</p>
        <p className="text-xs text-dark/50">{timeAgo(book.updated_at)}</p>
      </div>
    </div>
  );
}