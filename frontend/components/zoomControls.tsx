"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

type Props = {
  zoom: number;
  onZoomChange: (zoom: number) => void;
};

export default function ZoomControls({ zoom, onZoomChange }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(zoom));

  function commit() {
    const parsed = Number(draft);
    const value = Number.isFinite(parsed) ? Math.min(300, Math.max(10, Math.round(parsed))) : zoom;
    onZoomChange(value);
    setEditing(false);
  }

  return (
    <div className="flex items-center gap-2 rounded-full bg-white px-2 py-1.5 shadow-md">
      <button
        onClick={() => onZoomChange(Math.max(10, zoom - 10))}
        className="rounded-full p-1.5 text-dark/50 hover:bg-cream-dark hover:text-dark"
      >
        <Minus size={16} />
      </button>

      {editing ? (
        <input
          autoFocus
          type="number"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === "Enter") commit();
            if (e.key === "Escape") setEditing(false);
          }}
          className="w-12 rounded border border-dark/10 text-center text-sm outline-none"
        />
      ) : (
        <button
          onClick={() => { setDraft(String(zoom)); setEditing(true); }}
          className="w-12 text-center text-sm font-medium hover:text-coral"
          title="Cliquer pour saisir une valeur précise"
        >
          {zoom}%
        </button>
      )}

      <button
        onClick={() => onZoomChange(Math.min(300, zoom + 10))}
        className="rounded-full p-1.5 text-dark/50 hover:bg-cream-dark hover:text-dark"
      >
        <Plus size={16} />
      </button>
    </div>
  );
}