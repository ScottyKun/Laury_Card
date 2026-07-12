"use client";

import { useEffect, useState } from "react";
import { Canvas, FabricObject } from "fabric";
import EditorHeader from "@/components/editorHeader";
import EditorSidebar, { EditorTool } from "@/components/editorSidebar";
import EditorPanel from "@/components/editorPanel";
import TextPanel from "@/components/panels/textPanel";
import FormatPanel from "@/components/panels/formatPanel";
import BackgroundPanel from "@/components/panels/backgroundPanel";
import ShapesPanel from "@/components/panels/shapesPanel";
import PropertiesPanel from "@/components/propertiesPanel";
import ZoomControls from "@/components/zoomControls";
import CardCanvas from "@/components/cardCanvas";
import { saveCard, getCardById } from "@/lib/api";
import { useCanvasHistory } from "@/hooks/useCanvasHistory";
import { CardFormat, FORMATS } from "@/lib/formats";
import { useSearchParams, useRouter } from "next/navigation";
import StickersPanel from "@/components/panels/stickersPanel";
import ImagesPanel from "@/components/panels/imagesPanel";
import UnsavedChangesModal from "@/components/unsavedChangesModal";

export default function CreatePage() {
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [activeTool, setActiveTool] = useState<EditorTool>("text");
  const [zoom, setZoom] = useState(100);
  const [selectedObject, setSelectedObject] = useState<FabricObject | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | undefined>();
  const [format, setFormat] = useState<CardFormat>(FORMATS[2]); // A5 par défaut
  const { undo, redo, canUndo, canRedo, pushState, resetHistory  } = useCanvasHistory(canvas);
  const [cardId, setCardId] = useState<string | null>(null);
  const [title, setTitle] = useState("Carte sans titre");
  const searchParams = useSearchParams();
  const cardIdParam = searchParams.get("id");
  const [pendingCanvasJson, setPendingCanvasJson] = useState<object | null>(null);
  const router = useRouter();
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  //Depuis ID
  useEffect(() => {
    if (!cardIdParam) return;
    const id: string = cardIdParam;

    async function load() {
      try {
        const card = await getCardById(id);
        setCardId(card.id);
        setTitle(card.title);

        const matchingPreset = FORMATS.find((f) => f.id === card.format);
        setFormat({
          id: card.format,
          label: matchingPreset?.label || "Personnalisé",
          widthPx: card.width_px,
          heightPx: card.height_px,
        });

        setPendingCanvasJson(card.canvas_json);
      } catch (err) {
        console.error(err);
        alert("Impossible de charger cette carte");
      }
    }
    load();
  }, [cardIdParam]);

  // Applique le JSON chargé une fois le canvas prêt (et au bon format)
  useEffect(() => {
    if (!canvas || !pendingCanvasJson) return;

    canvas.loadFromJSON(pendingCanvasJson).then(() => {
      canvas.renderAll();
      resetHistory(); // la carte chargée devient la nouvelle base de l'historique
      setPendingCanvasJson(null);
    });
  }, [canvas, pendingCanvasJson, resetHistory])

  useEffect(() => {
    if (!canvas) return;
    const updateSelection = () => setSelectedObject(canvas.getActiveObject() || null);
    canvas.on("selection:created", updateSelection);
    canvas.on("selection:updated", updateSelection);
    canvas.on("selection:cleared", () => setSelectedObject(null));
    return () => {
      canvas.off("selection:created", updateSelection);
      canvas.off("selection:updated", updateSelection);
      canvas.off("selection:cleared");
    };
  }, [canvas]);

  useEffect(() => {
    if (!canvas) return;
    const fabricCanvas = canvas;
    function handleKeyDown(e: KeyboardEvent) {
      const active = fabricCanvas.getActiveObject();
      if (!active) return;
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

  // Marque "modifié" sur tout ajout/suppression/manipulation d'objet
  useEffect(() => {
    if (!canvas) return;
    const markDirty = () => setIsDirty(true);
    canvas.on("object:added", markDirty);
    canvas.on("object:modified", markDirty);
    canvas.on("object:removed", markDirty);
    return () => {
      canvas.off("object:added", markDirty);
      canvas.off("object:modified", markDirty);
      canvas.off("object:removed", markDirty);
    };
  }, [canvas]);

  // Empêche la fermeture d'onglet/rafraîchissement sans confirmation
  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  function handleBack() {
    if (isDirty) setShowUnsavedModal(true);
    else router.push("/dashboard");
  }

  async function handleSaveAndLeave() {
    await handleSave();
    setShowUnsavedModal(false);
    router.push("/dashboard");
  }

  function handleDiscardAndLeave() {
    setShowUnsavedModal(false);
    router.push("/dashboard");
  }

  async function handleSave() {
    if (!canvas) return;
    setSaving(true);
    try {
      const canvasJson = canvas.toObject(["isSticker"]);
      const thumbnail = canvas.toDataURL({ format: "png", multiplier: 2 });
      const { card } = await saveCard({
        cardId: cardId || undefined,
        title,
        canvasJson,
        thumbnail,
        format: format.id,
        widthPx: format.widthPx,
        heightPx: format.heightPx,
      });
      setCardId(card.id);
      setSavedAt(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));
      setIsDirty(false);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  }

  function handleExport() {
    if (!canvas) return;
    const dataUrl = canvas.toDataURL({ format: "png", multiplier: 3 });
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

  function renderLeftPanel() {
    switch (activeTool) {
      case "text":
        return <TextPanel canvas={canvas} />;
      case "format":
        return <FormatPanel currentFormat={format} onSelect={(f) => { setFormat(f); pushState(); setIsDirty(true); }} />;
      case "background":
        return <BackgroundPanel canvas={canvas} onChange={() => { pushState(); setIsDirty(true); }} />;
      case "shapes":
        return <ShapesPanel canvas={canvas} onChange={() => { pushState(); setIsDirty(true); }} />;
      case "stickers":
        return <StickersPanel canvas={canvas} onChange={() => { pushState(); setIsDirty(true); }} />;
      case "images":
        return <ImagesPanel canvas={canvas} onChange={() => { pushState(); setIsDirty(true); }} />;
      default:
        return <EditorPanel activeTool={activeTool} />;
    }
  }

  const panelTitles: Record<EditorTool, string> = {
    format: "Format",
    text: "Texte",
    shapes: "Formes",
    stickers: "Stickers",
    images: "Images",
    background: "Fond",
  };

  return (
    <div className="flex h-screen flex-col">
      <EditorHeader
        title={title}
        onBack={handleBack}
        onTitleChange={(t) => { setTitle(t); setIsDirty(true); }}
        format={format.label}
        savedAt={savedAt}
        onSave={handleSave}
        saving={saving}
        onExport={handleExport}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      /> 

      <div className="flex flex-1 overflow-hidden">
        <EditorSidebar activeTool={activeTool} onSelectTool={setActiveTool} />

        <div className="flex w-72 flex-col border-r border-dark/10 bg-white">
          <div className="border-b border-dark/10 px-5 py-4">
            <h2 className="font-medium">{panelTitles[activeTool]}</h2>
          </div>
          {renderLeftPanel()}
        </div>

        <div className="relative flex flex-1 items-center justify-center overflow-auto bg-dark/90 p-8">
          <div style={{ transform: `scale(${zoom / 100})` }}>
            <CardCanvas width={format.widthPx} height={format.heightPx} onReady={setCanvas} />
          </div>
          <ZoomControls zoom={zoom} onZoomChange={setZoom} />
        </div>

        <PropertiesPanel
          canvas={canvas}
          selectedObject={selectedObject}
          onDelete={handleDeleteSelected}
          onChange={() => { pushState(); setIsDirty(true); }}
        />
      </div>
      <UnsavedChangesModal
        open={showUnsavedModal}
        onSave={handleSaveAndLeave}
        onDiscard={handleDiscardAndLeave}
        onCancel={() => setShowUnsavedModal(false)}
        saving={saving}
      />
    </div>
  );
}