"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Undo2, Redo2, Share2, Download, Save } from "lucide-react";

type Props = {
  title: string;
  onTitleChange: (title: string) => void;
  format: string;
  savedAt?: string;
  onSave: () => void;
  saving?: boolean;
  onExport: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onBack: () => void;
  onShare: () => void;
  isOwner?: boolean;
  onPreview: () => void;
};

export default function EditorHeader({
  title, onTitleChange, format, savedAt, onSave, saving, onExport, onUndo, onRedo, canUndo, canRedo, onBack, onShare, isOwner, onPreview,
}: Props) {
  const router = useRouter();
  const [editingTitle, setEditingTitle] = useState(false);
  const [draftTitle, setDraftTitle] = useState(title);

  function startEditing() {
    setDraftTitle(title);
    setEditingTitle(true);
  }

  function commitTitle() {
    const trimmed = draftTitle.trim();
    onTitleChange(trimmed || "Carte sans titre");
    setEditingTitle(false);
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-dark/10 bg-cream-dark px-4">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="rounded-lg p-2 text-dark/60 hover:bg-white hover:text-dark">
          <ArrowLeft size={20} />
        </button>
        <div>
          {editingTitle ? (
            <input
              autoFocus
              value={draftTitle}
              onChange={(e) => setDraftTitle(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitTitle();
                if (e.key === "Escape") setEditingTitle(false);
              }}
              className="rounded-md border border-coral bg-white px-2 py-0.5 text-sm font-medium outline-none"
            />
          ) : (
            <p
              onClick={startEditing}
              className="cursor-text rounded-md px-2 py-0.5 text-sm font-medium hover:bg-white/60"
            >
              {title}
            </p>
          )}
          {!isOwner && (
            <span className="ml-2 rounded-full bg-coral/10 px-2 py-0.5 text-xs font-medium text-coral">
              Reçue — enregistrer pour garder une copie
            </span>
          )}
          <p className="px-2 text-xs text-dark/50">
            Format {format} {savedAt && `· Sauvegardé à ${savedAt}`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 rounded-lg bg-white p-1 shadow-sm">
        <button onClick={onUndo} disabled={!canUndo} className="rounded-md p-2 text-dark/40 hover:bg-cream-dark hover:text-dark disabled:opacity-40 disabled:hover:bg-transparent">
          <Undo2 size={18} />
        </button>
        <button onClick={onRedo} disabled={!canRedo} className="rounded-md p-2 text-dark/40 hover:bg-cream-dark hover:text-dark disabled:opacity-40 disabled:hover:bg-transparent">
          <Redo2 size={18} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button onClick={onPreview} className="text-sm font-medium text-dark/70 hover:text-dark">
          Aperçu
        </button>
        <button onClick={onSave} disabled={saving} className="flex items-center gap-2 rounded-full border border-dark/10 px-4 py-2 text-sm font-medium text-dark hover:bg-white disabled:opacity-60">
          <Save size={16} /> {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
        <button onClick={onShare} className="flex items-center gap-2 rounded-full bg-coral-light/20 px-4 py-2 text-sm font-medium text-coral-dark hover:bg-coral-light/30">
          <Share2 size={16} /> Partager
        </button>
        <button onClick={onExport} className="flex items-center gap-2 rounded-full bg-coral px-4 py-2 text-sm font-medium text-white hover:bg-coral-dark">
          <Download size={16} /> Exporter
        </button>
      </div>
    </header>
  );
}