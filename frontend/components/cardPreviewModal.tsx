"use client";

import { X } from "lucide-react";

type Props = {
  thumbnailUrl: string | null;
  widthPx: number;
  heightPx: number;
  onClose: () => void;
};

export default function CardPreviewModal({ thumbnailUrl, widthPx, heightPx, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-dark/90 px-4">
      <button onClick={onClose} className="absolute right-6 top-6 rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white">
        <X size={24} />
      </button>

      <div
        style={{ aspectRatio: `${widthPx} / ${heightPx}` }}
        className="max-h-[80vh] max-w-[80vw] overflow-hidden rounded-xl bg-white shadow-2xl"
      >
        {thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={thumbnailUrl} alt="Aperçu de la carte" className="h-full w-full object-contain" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm text-dark/40">
            Enregistrez la carte au moins une fois pour voir l&apos;aperçu.
          </div>
        )}
      </div>
    </div>
  );
}