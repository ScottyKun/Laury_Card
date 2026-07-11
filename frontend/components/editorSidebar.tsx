"use client";

import { LayoutTemplate, Type, Square, Sticker, Image, Palette } from "lucide-react";

export type EditorTool = "format" | "text" | "shapes" | "stickers" | "images" | "background";

const tools: { id: EditorTool; label: string; icon: typeof Type }[] = [
  { id: "format", label: "Format", icon: LayoutTemplate },
  { id: "text", label: "Texte", icon: Type },
  { id: "shapes", label: "Formes", icon: Square },
  { id: "stickers", label: "Stickers", icon: Sticker },
  { id: "images", label: "Images", icon: Image },
  { id: "background", label: "Fond", icon: Palette },
];

type Props = {
  activeTool: EditorTool;
  onSelectTool: (tool: EditorTool) => void;
};

export default function EditorSidebar({ activeTool, onSelectTool }: Props) {
  return (
    <aside className="flex w-20 flex-col items-center gap-1 border-r border-dark/10 bg-white py-4">
      {tools.map(({ id, label, icon: Icon }) => {
        const isActive = activeTool === id;
        return (
          <button
            key={id}
            onClick={() => onSelectTool(id)}
            className={`flex w-16 flex-col items-center gap-1 rounded-lg py-2.5 text-xs transition ${
              isActive ? "bg-coral/10 text-coral" : "text-dark/50 hover:bg-cream-dark hover:text-dark"
            }`}
          >
            <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
            {label}
          </button>
        );
      })}
    </aside>
  );
}