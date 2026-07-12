"use client";

import { useEffect, useState } from "react";
import { Canvas, Group, FabricObject, Textbox, loadSVGFromString } from "fabric";

const paletteColors = ["#F0785A", "#F79C86", "#2A211D", "#A8D8F0", "#C9B6E4", "#FAD2E1", "#B7E4C7", "#FFD97D"];

const defaultIcons = [
  "mdi:heart", "mdi:star", "mdi:gift", "mdi:cake-variant",
  "mdi:balloon", "mdi:flower", "mdi:cloud", "mdi:moon-waning-crescent",
  "mdi:diamond-stone", "mdi:party-popper", "mdi:ring", "mdi:paw",
];

const emojis = [
  "❤️", "🎉", "🎂", "🎈", "🌸", "☁️", "⭐", "💍",
  "🥂", "🌙", "🦋", "🐻", "🎊", "💌", "🍀", "☀️",
  "🌈", "🐣", "🍰", "🎀",
];

type Tab = "emoji" | "icons";

type Props = {
  canvas: Canvas | null;
  onChange: () => void;
};

export default function StickersPanel({ canvas, onChange }: Props) {
  const [tab, setTab] = useState<Tab>("emoji");
  const [color, setColor] = useState("#F0785A");
  const [query, setQuery] = useState("");
  const [icons, setIcons] = useState<string[]>(defaultIcons);
  const [loading, setLoading] = useState(false);

  // Recherche Iconify avec un léger debounce
  useEffect(() => {
    if (!query.trim()) {
      setIcons(defaultIcons);
      return;
    }
    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=48`);
        const data = await res.json();
        setIcons(data.icons || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }, 400);
    return () => clearTimeout(timeout);
  }, [query]);

  function addEmoji(emoji: string) {
    if (!canvas) return;
    const text = new Textbox(emoji, {
      left: 100,
      top: 100,
      fontSize: 64,
      width: 90,
    });
    text.set({ isSticker: true });
    canvas.add(text);
    canvas.setActiveObject(text);
    canvas.renderAll();
    onChange();
  }

  async function addIcon(iconId: string) {
    if (!canvas) return;
    try {
      const url = `https://api.iconify.design/${iconId}.svg?color=${encodeURIComponent(color)}`;
      const res = await fetch(url);
      const svgText = await res.text();

      const { objects } = await loadSVGFromString(svgText);
      const validObjects = objects.filter((o): o is FabricObject => !!o);
      if (validObjects.length === 0) return;

      const shape = validObjects.length > 1 ? new Group(validObjects) : validObjects[0];
      shape.set({ left: 90, top: 90 });
      shape.set({ isSticker: true });
      shape.scaleToWidth(80);

      canvas.add(shape);
      canvas.setActiveObject(shape);
      canvas.renderAll();
      onChange();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div className="flex flex-col gap-4 p-5">
      <div className="flex rounded-full bg-cream-dark p-1">
        <button
          onClick={() => setTab("emoji")}
          className={`flex-1 rounded-full py-2 text-sm font-medium ${tab === "emoji" ? "bg-white shadow-sm" : "text-dark/50"}`}
        >
          Emojis
        </button>
        <button
          onClick={() => setTab("icons")}
          className={`flex-1 rounded-full py-2 text-sm font-medium ${tab === "icons" ? "bg-white shadow-sm" : "text-dark/50"}`}
        >
          Icônes
        </button>
      </div>

      {tab === "emoji" ? (
        <div className="grid grid-cols-5 gap-2">
          {emojis.map((emoji) => (
            <button
              key={emoji}
              onClick={() => addEmoji(emoji)}
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-dark/10 text-2xl hover:border-coral hover:bg-coral/5"
            >
              {emoji}
            </button>
          ))}
        </div>
      ) : (
        <>
          <div>
            <p className="mb-2 text-xs font-medium uppercase text-dark/50">Couleur de l'icône</p>
            <div className="flex flex-wrap gap-2">
              {paletteColors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`h-7 w-7 rounded-full border-2 ${color === c ? "border-dark" : "border-transparent"}`}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="h-7 w-7 cursor-pointer rounded-full border border-dark/10"
              />
            </div>
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher une icône (ex: cœur, fleur...)"
            className="w-full rounded-lg border border-dark/10 px-3 py-2 text-sm"
          />

          {loading ? (
            <p className="text-center text-sm text-dark/40">Recherche...</p>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {icons.map((icon) => (
                <button
                  key={icon}
                  onClick={() => addIcon(icon)}
                  className="flex h-14 items-center justify-center rounded-lg border border-dark/10 p-2 hover:border-coral hover:bg-coral/5"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={`https://api.iconify.design/${icon}.svg?color=%232A211D`} alt={icon} className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}