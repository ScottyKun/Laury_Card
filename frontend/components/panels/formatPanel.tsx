"use client";

import { useState } from "react";
import { CardFormat, FORMATS, CM_TO_PX } from "@/lib/formats";
import { RectangleVertical, RectangleHorizontal } from "lucide-react";

type Props = {
  currentFormat: CardFormat;
  onSelect: (format: CardFormat) => void;
};

export default function FormatPanel({ currentFormat, onSelect }: Props) {
  const [customWidthCm, setCustomWidthCm] = useState(15);
  const [customHeightCm, setCustomHeightCm] = useState(21);

  const isLandscape = currentFormat.widthPx > currentFormat.heightPx;

  function toggleOrientation() {
    onSelect({
      ...currentFormat,
      widthPx: currentFormat.heightPx,
      heightPx: currentFormat.widthPx,
    });
  }

  function applyCustom() {
    onSelect({
      id: "custom",
      label: "Personnalisé",
      widthPx: Math.round(customWidthCm * CM_TO_PX),
      heightPx: Math.round(customHeightCm * CM_TO_PX),
    });
  }

  return (
    <div className="flex flex-col gap-3 p-5">
      <div>
        <p className="mb-2 text-xs font-medium uppercase text-dark/50">Orientation</p>
        <div className="flex gap-2">
          <button
            onClick={() => !isLandscape || toggleOrientation()}
            className={`flex flex-1 flex-col items-center gap-1 rounded-lg border py-3 text-xs ${
              !isLandscape ? "border-coral bg-coral/5 text-coral" : "border-dark/10"
            }`}
          >
            <RectangleVertical size={20} /> Portrait
          </button>
          <button
            onClick={() => isLandscape || toggleOrientation()}
            className={`flex flex-1 flex-col items-center gap-1 rounded-lg border py-3 text-xs ${
              isLandscape ? "border-coral bg-coral/5 text-coral" : "border-dark/10"
            }`}
          >
            <RectangleHorizontal size={20} /> Paysage
          </button>
        </div>
      </div>

      <div className="border-t border-dark/10 pt-4">
        {FORMATS.map((format) => (
          <button
            key={format.id}
            onClick={() => onSelect(isLandscape ? { ...format, widthPx: format.heightPx, heightPx: format.widthPx } : format)}
            className={`mb-2 flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left text-sm ${
              currentFormat.id === format.id
                ? "border-coral bg-coral/5 text-coral"
                : "border-dark/10 hover:border-coral/50"
            }`}
          >
            <span>{format.label}</span>
            <span className="text-xs text-dark/40">
              {format.widthPx}×{format.heightPx}px
            </span>
          </button>
        ))}
      </div>

      <div className="border-t border-dark/10 pt-4">
        <p className="mb-2 text-xs font-medium uppercase text-dark/50">Personnalisé (cm)</p>
        <div className="flex items-center gap-2">
          <input type="number" value={customWidthCm} onChange={(e) => setCustomWidthCm(Number(e.target.value))} className="w-full rounded-lg border border-dark/10 px-3 py-2 text-sm" />
          <span className="text-dark/40">×</span>
          <input type="number" value={customHeightCm} onChange={(e) => setCustomHeightCm(Number(e.target.value))} className="w-full rounded-lg border border-dark/10 px-3 py-2 text-sm" />
        </div>
        <button onClick={applyCustom} className="mt-3 w-full rounded-lg bg-coral py-2 text-sm font-medium text-white hover:bg-coral-dark">
          Appliquer
        </button>
      </div>
    </div>
  );
}