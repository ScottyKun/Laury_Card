"use client";

import { Canvas, Textbox } from "fabric";

type Props = {
  canvas: Canvas | null;
};

const presets = [
  { label: "Titre", fontSize: 48, fontFamily: "Caveat", text: "Joyeux Anniversaire !" },
  { label: "Sous-titre", fontSize: 20, fontFamily: "Inter", text: "Un petit mot pour vous" },
  { label: "Texte simple", fontSize: 16, fontFamily: "Inter", text: "Cliquez pour modifier" },
];

export default function TextPanel({ canvas }: Props) {
  function addText(preset: (typeof presets)[number]) {
    if (!canvas) return;

    const textbox = new Textbox(preset.text, {
      left: 60,
      top: 100,
      width: 300,
      fontSize: preset.fontSize,
      fontFamily: preset.fontFamily,
      fill: "#1f2937",
    });

    canvas.add(textbox);
    canvas.setActiveObject(textbox);
    canvas.renderAll();
  }

  return (
    <div className="flex flex-col gap-3 p-5">
      {presets.map((preset) => (
        <button
          key={preset.label}
          onClick={() => addText(preset)}
          className="rounded-lg border border-dark/10 px-4 py-3 text-left text-sm hover:border-coral hover:bg-coral/5"
        >
          <p style={{ fontFamily: preset.fontFamily === "Caveat" ? "var(--font-hand)" : "inherit" }} className="text-lg">
            {preset.label}
          </p>
        </button>
      ))}
    </div>
  );
}