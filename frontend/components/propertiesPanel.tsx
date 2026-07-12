"use client";

import { useEffect, useState } from "react";
import { Layers, Trash2 } from "lucide-react";
import { Canvas, FabricObject, Textbox } from "fabric";

const fontOptions = [
  "Inter", "Caveat", "Playfair Display", "Poppins", "Montserrat",
  "Quicksand", "Nunito", "Lora", "Merriweather", "Dancing Script",
  "Pacifico", "Indie Flower", "Great Vibes", "Roboto Slab", "Abril Fatface",
];

type Props = {
  canvas: Canvas | null;
  selectedObject: FabricObject | null;
  onDelete: () => void;
  onChange: () => void; // <-- déclenche pushState + isDirty côté page
};

function isTextbox(obj: FabricObject): obj is Textbox {
  return obj.type === "textbox";
}

export default function PropertiesPanel({ canvas, selectedObject, onDelete, onChange }: Props) {
  const [fontFamily, setFontFamily] = useState("Inter");
  const [fontSize, setFontSize] = useState(16);
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [underline, setUnderline] = useState(false);
  const [color, setColor] = useState("#1f2937");
  const [opacity, setOpacity] = useState(100);

  useEffect(() => {
    if (!selectedObject) return;
    setColor((selectedObject.fill as string) || "#1f2937");
    setOpacity(Math.round((selectedObject.opacity ?? 1) * 100));

    if (isTextbox(selectedObject)) {
      setFontFamily(selectedObject.fontFamily || "Inter");
      setFontSize(selectedObject.fontSize || 16);
      setBold(selectedObject.fontWeight === "bold");
      setItalic(selectedObject.fontStyle === "italic");
      setUnderline(!!selectedObject.underline);
    }
  }, [selectedObject]);

  function apply(props: Partial<FabricObject>) {
    if (!selectedObject || !canvas) return;

    if (selectedObject.type === "group" && "fill" in props) {
      (selectedObject as any).getObjects().forEach((child: FabricObject) => {
        child.set({ fill: props.fill });
      });
    } else {
      selectedObject.set(props);
    }

    canvas.renderAll();
    onChange();
  }

  if (!selectedObject) {
    return (
      <div className="flex w-72 flex-col border-l border-dark/10 bg-white">
        <div className="flex items-center gap-2 border-b border-dark/10 px-5 py-4">
          <Layers size={16} />
          <h2 className="font-medium">Propriétés</h2>
        </div>
        <div className="flex flex-1 items-center justify-center px-5 text-center text-sm text-dark/40">
          Sélectionnez un élément pour voir ses propriétés
        </div>
      </div>
    );
  }

  const isImage = selectedObject.type === "image";
  const isSticker = !!(selectedObject as any).isSticker;
  const simplifiedView = isImage || isSticker;
  const textObject = !simplifiedView && isTextbox(selectedObject) ? selectedObject : null;

  return (
    <div className="flex w-72 flex-col border-l border-dark/10 bg-white">
      <div className="flex items-center justify-between border-b border-dark/10 px-5 py-4">
        <div className="flex items-center gap-2">
          <Layers size={16} />
          <h2 className="font-medium">Propriétés</h2>
        </div>
        <button onClick={onDelete} className="rounded-lg p-1.5 text-dark/40 hover:bg-red-50 hover:text-red-500">
          <Trash2 size={16} />
        </button>
      </div>

      <div className="flex flex-col gap-4 p-5">
        {simplifiedView ? (
          <div>
            <label className="mb-1.5 block text-xs font-medium uppercase text-dark/50">Opacité</label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                value={opacity}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setOpacity(value);
                  apply({ opacity: value / 100 });
                }}
                className="flex-1"
              />
              <span className="w-10 text-right text-sm text-dark/60">{opacity}%</span>
            </div>
          </div>
        ) : (
          <>
            {textObject && (
              <>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase text-dark/50">Typographie</label>
                  <select
                    value={fontFamily}
                    onChange={(e) => { setFontFamily(e.target.value); apply({ fontFamily: e.target.value } as Partial<Textbox>); }}
                    className="w-full rounded-lg border border-dark/10 px-3 py-2 text-sm"
                  >
                    {fontOptions.map((font) => (
                      <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={fontSize}
                    onChange={(e) => { const v = Number(e.target.value); setFontSize(v); apply({ fontSize: v } as Partial<Textbox>); }}
                    className="w-16 rounded-lg border border-dark/10 px-2 py-2 text-sm"
                  />
                  <button onClick={() => { const v = !bold; setBold(v); apply({ fontWeight: v ? "bold" : "normal" } as Partial<Textbox>); }} className={`flex-1 rounded-lg border py-2 text-sm font-bold ${bold ? "border-coral bg-coral/10 text-coral" : "border-dark/10"}`}>B</button>
                  <button onClick={() => { const v = !italic; setItalic(v); apply({ fontStyle: v ? "italic" : "normal" } as Partial<Textbox>); }} className={`flex-1 rounded-lg border py-2 text-sm italic ${italic ? "border-coral bg-coral/10 text-coral" : "border-dark/10"}`}>I</button>
                  <button onClick={() => { const v = !underline; setUnderline(v); apply({ underline: v } as Partial<Textbox>); }} className={`flex-1 rounded-lg border py-2 text-sm underline ${underline ? "border-coral bg-coral/10 text-coral" : "border-dark/10"}`}>U</button>
                </div>
              </>
            )}

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase text-dark/50">
                {textObject ? "Couleur du texte" : "Couleur de remplissage"}
              </label>
              <div className="flex items-center gap-2">
                <input type="color" value={color} onChange={(e) => { setColor(e.target.value); apply({ fill: e.target.value }); }} className="h-9 w-9 cursor-pointer rounded-lg border border-dark/10" />
                <span className="text-sm text-dark/60">{color}</span>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase text-dark/50">Opacité</label>
              <div className="flex items-center gap-3">
                <input type="range" min={0} max={100} value={opacity} onChange={(e) => { const v = Number(e.target.value); setOpacity(v); apply({ opacity: v / 100 }); }} className="flex-1" />
                <span className="w-10 text-right text-sm text-dark/60">{opacity}%</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}