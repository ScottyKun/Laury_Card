"use client";

import { useState } from "react";
import { Canvas, Gradient } from "fabric";

const solidColors = [
  "#FAF6F1", "#FFFFFF", "#2A211D", "#F0785A", "#F79C86", "#D65F42",
  "#DCEEFB", "#A8D8F0", "#E9E1F9", "#C9B6E4", "#FDE2E4", "#FAD2E1",
  "#D8F3DC", "#B7E4C7", "#FFF3B0", "#FFD6A5", "#CDEAC0", "#E0FBFC",
];

const gradientPresets = [
  { label: "Corail", from: "#F79C86", to: "#F0785A" },
  { label: "Lavande", from: "#E9E1F9", to: "#C9B6E4" },
  { label: "Ciel", from: "#DCEEFB", to: "#A8D8F0" },
  { label: "Douceur", from: "#FDE2E4", to: "#FAD2E1" },
  { label: "Menthe", from: "#D8F3DC", to: "#B7E4C7" },
  { label: "Soleil", from: "#FFF3B0", to: "#FFD6A5" },
];

type Props = {
  canvas: Canvas | null;
  onChange: () => void;
};

export default function BackgroundPanel({ canvas, onChange }: Props) {
  const [customColor, setCustomColor] = useState("#FAF6F1");

  function setSolid(color: string) {
    if (!canvas) return;
    canvas.backgroundColor = color;
    canvas.renderAll();
    onChange();
  }

  function setGradient(from: string, to: string) {
    if (!canvas) return;
    const gradient = new Gradient({
      type: "linear",
      coords: { x1: 0, y1: 0, x2: canvas.width, y2: canvas.height },
      colorStops: [
        { offset: 0, color: from },
        { offset: 1, color: to },
      ],
    });
    canvas.backgroundColor = gradient;
    canvas.renderAll();
    onChange();
  }

  return (
    <div className="flex flex-col gap-6 p-5">
      <div>
        <p className="mb-2 text-xs font-medium uppercase text-dark/50">Couleur personnalisée</p>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={customColor}
            onChange={(e) => {
              setCustomColor(e.target.value);
              setSolid(e.target.value);
            }}
            className="h-9 w-9 cursor-pointer rounded-lg border border-dark/10"
          />
          <span className="text-sm text-dark/60">{customColor}</span>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase text-dark/50">Couleurs unies</p>
        <div className="grid grid-cols-6 gap-2">
          {solidColors.map((color) => (
            <button
              key={color}
              onClick={() => setSolid(color)}
              className="h-8 w-8 rounded-lg border border-dark/10"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium uppercase text-dark/50">Dégradés</p>
        <div className="grid grid-cols-2 gap-2">
          {gradientPresets.map((g) => (
            <button
              key={g.label}
              onClick={() => setGradient(g.from, g.to)}
              className="h-14 rounded-lg text-xs font-medium text-white shadow-sm"
              style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}