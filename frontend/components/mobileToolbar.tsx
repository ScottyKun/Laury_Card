"use client";

import { EditorTool } from "@/components/editorSidebar";
import { LayoutTemplate, Type, Square, Sticker, Image, Palette, X } from "lucide-react";

const tools: { id: EditorTool; label: string; icon: typeof Type }[] = [
  { id: "format", label: "Format", icon: LayoutTemplate },
  { id: "text", label: "Texte", icon: Type },
  { id: "shapes", label: "Formes", icon: Square },
  { id: "stickers", label: "Stickers", icon: Sticker },
  { id: "images", label: "Images", icon: Image },
  { id: "background", label: "Fond", icon: Palette },
];

type Props = {
  activeTool: EditorTool | null; // pour la mise en avant des icônes de la barre
  onSelectTool: (tool: EditorTool | null) => void;
  sheetOpen: boolean; // le tiroir peut s'ouvrir pour un outil OU pour les propriétés d'une sélection
  sheetTitle: string;
  onCloseSheet: () => void;
  children: React.ReactNode;
};

export default function MobileToolbar({
  activeTool, onSelectTool, sheetOpen, sheetTitle, onCloseSheet, children,
}: Props) {
  return (
    <>
      {sheetOpen && (
        <div className="fixed inset-x-0 bottom-16 z-40 max-h-[50vh] overflow-y-auto rounded-t-2xl border-t border-dark/10 bg-white shadow-2xl">
          <div className="sticky top-0 flex items-center justify-between border-b border-dark/10 bg-white px-4 py-3">
            <h2 className="font-medium">{sheetTitle}</h2>
            <button onClick={onCloseSheet} className="rounded-lg p-1.5 text-dark/40 hover:bg-cream-dark">
              <X size={18} />
            </button>
          </div>
          {children}
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-30 flex justify-around border-t border-dark/10 bg-white py-2">
        {tools.map(({ id, label, icon: Icon }) => {
          const isActive = activeTool === id;
          return (
            <button
              key={id}
              onClick={() => onSelectTool(isActive ? null : id)}
              className={`flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-[10px] transition hover:bg-cream-dark hover:text-coral ${
                isActive ? "text-coral" : "text-dark/50"
              }`}
            >
              <Icon size={20} />
              {label}
            </button>
          );
        })}
      </div>
    </>
  );
}