"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Undo2, Redo2, Share2, Download, Save } from "lucide-react";

type Props = {
  title: string;
  format: string;
  savedAt?: string;
  onSave: () => void;
  saving?: boolean;
  onExport: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

export default function EditorHeader({ title, format, savedAt, onSave, saving, onExport, onUndo, onRedo, canUndo, canRedo }: Props) {
  const router = useRouter();

  return (
    <header className="flex h-16 items-center justify-between border-b border-dark/10 bg-cream-dark px-4">
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="rounded-lg p-2 text-dark/60 hover:bg-white hover:text-dark"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs text-dark/50">
            Format {format} {savedAt && `· Sauvegardé à ${savedAt}`}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 rounded-lg bg-white p-1 shadow-sm">
        <button
          onClick={onUndo}
          className="rounded-md p-2 text-dark/40 hover:bg-cream-dark hover:text-dark disabled:opacity-40"
          disabled={!canUndo}
        >
          <Undo2 size={18} />
        </button>
        <button
          onClick={onRedo}
          className="rounded-md p-2 text-dark/40 hover:bg-cream-dark hover:text-dark disabled:opacity-40"
          disabled={!canRedo}
        >
          <Redo2 size={18} />
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button className="text-sm font-medium text-dark/70 hover:text-dark">Aperçu</button>
        <button
          onClick={onSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-full border border-dark/10 px-4 py-2 text-sm font-medium text-dark hover:bg-white disabled:opacity-60"
        >
          <Save size={16} /> {saving ? "Enregistrement..." : "Enregistrer"}
        </button>
        <button className="flex items-center gap-2 rounded-full bg-coral-light/20 px-4 py-2 text-sm font-medium text-coral-dark hover:bg-coral-light/30">
          <Share2 size={16} /> Partager
        </button>
        <button onClick={onExport}
            className="flex items-center gap-2 rounded-full bg-coral px-4 py-2 text-sm font-medium text-white hover:bg-coral-dark">
          <Download size={16} /> Exporter
        </button>
      </div>
    </header>
  );
}