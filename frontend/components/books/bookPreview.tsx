"use client";

import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

type PreviewPage = {
  thumbnailUrl: string | null;
  widthPx: number;
  heightPx: number;
  transitionType: "fade" | "slide" | "flip" | "zoom" | "rotate" | "none";
};

type Props = {
  pages: PreviewPage[];
  onClose: () => void;
};

const animationByType = {
  fade: "pageFadeIn 0.4s ease",
  slide: "pageSlideIn 0.4s ease",
  flip: "pageFlipIn 0.5s ease",
  zoom: "pageZoomIn 0.4s ease",
  rotate: "pageRotateIn 0.5s ease",
  none: "none",
};

export default function BookPreview({ pages, onClose }: Props) {
  const [index, setIndex] = useState(0);
  const current = pages[index];

  function next() {
    setIndex((i) => Math.min(i + 1, pages.length - 1));
  }

  function prev() {
    setIndex((i) => Math.max(i - 1, 0));
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
        if (e.key === "ArrowRight") next();
        if (e.key === "ArrowLeft") prev();
        if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [index]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-dark/95">
      <button onClick={onClose} className="absolute right-6 top-6 rounded-full p-2 text-white/70 hover:bg-white/10 hover:text-white">
        <X size={24} />
      </button>

      <div className="flex items-center gap-6">
        <button
          onClick={prev}
          disabled={index === 0}
          className="rounded-full p-3 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-20"
        >
          <ChevronLeft size={28} />
        </button>

        <div
          key={index}
          style={{
            aspectRatio: `${current.widthPx} / ${current.heightPx}`,
            animation: animationByType[current.transitionType],
          }}
          className="max-h-[75vh] max-w-[70vw] overflow-hidden rounded-xl bg-white shadow-2xl"
        >
          {current.thumbnailUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={current.thumbnailUrl} alt="" className="h-full w-full object-contain" />
          )}
        </div>

        <button
          onClick={next}
          disabled={index === pages.length - 1}
          className="rounded-full p-3 text-white/60 hover:bg-white/10 hover:text-white disabled:opacity-20"
        >
          <ChevronRight size={28} />
        </button>
      </div>

      <p className="mt-6 text-sm text-white/50">
        {index + 1} / {pages.length}
      </p>
    </div>
  );
}