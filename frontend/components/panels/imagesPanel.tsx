"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, FabricImage } from "fabric";
import { Upload } from "lucide-react";
import { uploadAsset, getAssets, Asset } from "@/lib/api";

type Props = {
  canvas: Canvas | null;
  onChange: () => void;
};

export default function ImagesPanel({ canvas, onChange }: Props) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getAssets().then(setAssets).catch(console.error);
  }, []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const asset = await uploadAsset(file);
      setAssets((prev) => [asset, ...prev]);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Erreur lors de l'upload");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function addImageToCanvas(url: string) {
    if (!canvas) return;
    const img = await FabricImage.fromURL(url, { crossOrigin: "anonymous" });

    // Limite la taille initiale pour ne pas déborder du canvas
    const maxDimension = 200;
    const scale = Math.min(maxDimension / (img.width || 1), maxDimension / (img.height || 1), 1);
    img.set({ left: 80, top: 80, scaleX: scale, scaleY: scale });

    canvas.add(img);
    canvas.setActiveObject(img);
    canvas.renderAll();
    onChange();
  }

  return (
    <div className="flex flex-col gap-4 p-5">
      <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" onChange={handleFileChange} className="hidden" />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        className="flex items-center justify-center gap-2 rounded-lg border-2 border-dashed border-dark/15 py-6 text-sm text-dark/60 hover:border-coral hover:text-coral disabled:opacity-60"
      >
        <Upload size={18} /> {uploading ? "Envoi en cours..." : "Importer une photo"}
      </button>

      {assets.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {assets.map((asset) => (
            <button
              key={asset.id}
              onClick={() => addImageToCanvas(asset.url)}
              className="aspect-square overflow-hidden rounded-lg border border-dark/10 hover:border-coral"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={asset.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}