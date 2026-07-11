"use client";

import { useEffect, useState } from "react";
import { Canvas, Textbox } from "fabric";
import EditorHeader from "@/components/editorHeader";
import EditorSidebar, { EditorTool } from "@/components/editorSidebar";
import EditorPanel from "@/components/editorPanel";
import TextPanel from "@/components/panels/textPanel";
import PropertiesPanel from "@/components/propertiesPanel";
import ZoomControls from "@/components/zoomControls";
import CardCanvas from "@/components/cardCanvas";
import { saveCard } from "@/lib/api";
import { useCanvasHistory } from "@/hooks/useCanvasHistory";

export default function CreatePage() {
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [activeTool, setActiveTool] = useState<EditorTool>("text");
  const [zoom, setZoom] = useState(100);
  const [selectedObject, setSelectedObject] = useState<Textbox | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | undefined>();
  const { undo, redo, canUndo, canRedo } = useCanvasHistory(canvas);

  // Écoute la sélection d'objets sur le canvas
  useEffect(() => {
    if (!canvas) return;

    const updateSelection = () => {
      const active = canvas.getActiveObject();
      setSelectedObject((active as Textbox) || null);
    };

    canvas.on("selection:created", updateSelection);
    canvas.on("selection:updated", updateSelection);
    canvas.on("selection:cleared", () => setSelectedObject(null));

    return () => {
      canvas.off("selection:created", updateSelection);
      canvas.off("selection:updated", updateSelection);
      canvas.off("selection:cleared");
    };
  }, [canvas]);
  
  // suppression
  useEffect(() => {
    if (!canvas) return;

    const fabricCanvas = canvas; // capture non-nullable, utilisée dans la closure

    function handleKeyDown(e: KeyboardEvent) {
      const active = fabricCanvas.getActiveObject();
      if (!active) return;

      // Si on édite du texte, laisser le comportement normal (effacer des caractères)
      if ((active as any).isEditing) return;

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        fabricCanvas.remove(active);
        fabricCanvas.discardActiveObject();
        fabricCanvas.renderAll();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [canvas]);

  async function handleSave() {
    if (!canvas) return;
    setSaving(true);
    try {
      const canvasJson = canvas.toJSON();
      const thumbnail = canvas.toDataURL({ format: "png", multiplier: 0.3 });
      await saveCard({ canvasJson, thumbnail, format: "A5", widthPx: 420, heightPx: 595 });
      setSavedAt(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  }

  function handleExport() {
    if (!canvas) return;

    const dataUrl = canvas.toDataURL({
      format: "png",
      multiplier: 3, // haute résolution pour l'export (le canvas affiché est en 420x595, x3 = qualité impression correcte)
    });

    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = "carte-cartesetmots.png";
    link.click();
  }

  function handleDeleteSelected() {
    if (!canvas || !selectedObject) return;
    canvas.remove(selectedObject);
    canvas.discardActiveObject();
    canvas.renderAll();
    setSelectedObject(null);
  }

  return (
    <div className="flex h-screen flex-col">
      <EditorHeader title="Carte sans titre" format="A5" savedAt={savedAt} onSave={handleSave} saving={saving} onExport={handleExport} onUndo={undo} onRedo={redo} canUndo={canUndo} canRedo={canRedo}/>

      <div className="flex flex-1 overflow-hidden">
        <EditorSidebar activeTool={activeTool} onSelectTool={setActiveTool} />

        {activeTool === "text" ? (
          <div className="flex w-72 flex-col border-r border-dark/10 bg-white">
            <div className="border-b border-dark/10 px-5 py-4">
              <h2 className="font-medium">Texte</h2>
            </div>
            <TextPanel canvas={canvas} />
          </div>
        ) : (
          <EditorPanel activeTool={activeTool} />
        )}

        <div className="relative flex flex-1 items-center justify-center overflow-auto bg-dark/90 p-8">
          <div style={{ transform: `scale(${zoom / 100})` }}>
            <CardCanvas width={420} height={595} onReady={setCanvas} />
          </div>
          <ZoomControls zoom={zoom} onZoomChange={setZoom} />
        </div>

        <PropertiesPanel canvas={canvas} selectedObject={selectedObject} onDelete={handleDeleteSelected} />
      </div>
    </div>
  );
}

