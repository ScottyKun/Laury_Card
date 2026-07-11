"use client";

import { Minus, Plus } from "lucide-react";

type Props = {
  zoom: number;
  onZoomChange: (zoom: number) => void;
};

export default function ZoomControls({ zoom, onZoomChange }: Props) {
  return (
    <div className="absolute bottom-6 right-6 flex items-center gap-2 rounded-full bg-white px-2 py-1.5 shadow-md">
      <button
        onClick={() => onZoomChange(Math.max(25, zoom - 10))}
        className="rounded-full p-1.5 text-dark/50 hover:bg-cream-dark hover:text-dark"
      >
        <Minus size={16} />
      </button>
      <span className="w-12 text-center text-sm font-medium">{zoom}%</span>
      <button
        onClick={() => onZoomChange(Math.min(200, zoom + 10))}
        className="rounded-full p-1.5 text-dark/50 hover:bg-cream-dark hover:text-dark"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}