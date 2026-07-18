"use client";

import { useEffect, useState } from "react";
import { Canvas, FabricObject } from "fabric";
import EditorHeader from "@/components/editorHeader";
import EditorSidebar, { EditorTool } from "@/components/editorSidebar";
import TextPanel from "@/components/panels/textPanel";
import FormatPanel from "@/components/panels/formatPanel";
import BackgroundPanel from "@/components/panels/backgroundPanel";
import ShapesPanel from "@/components/panels/shapesPanel";
import StickersPanel from "@/components/panels/stickersPanel";
import ImagesPanel from "@/components/panels/imagesPanel";
import PropertiesPanel from "@/components/propertiesPanel";
import ZoomControls from "@/components/zoomControls";
import CardCanvas from "@/components/cardCanvas";
import UnsavedChangesModal from "@/components/unsavedChangesModal";
import { saveCard, getCardById, forkCardApi } from "@/lib/api";
import { useCanvasHistory } from "@/hooks/useCanvasHistory";
import { FORMATS, CardFormat } from "@/lib/formats";
import ShareModal from "@/components/shareModal";
import CardPreviewModal from "./cardPreviewModal";
import { ChevronLeft, ChevronRight } from "lucide-react";

type SavedCard = {
  id: string;
  title: string;
  thumbnail_url: string | null;
  format: string;
  width_px: number;
  height_px: number;
};

type Props = {
  cardId?: string;
  onClose: () => void; // appelé quand l'utilisateur veut quitter (flèche retour / modal résolu)
  onSaved?: (card: SavedCard) => void; // appelé après un enregistrement réussi
};

export default function CardEditor({ cardId: cardIdProp, onClose, onSaved }: Props) {
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [cardId, setCardId] = useState<string | null>(cardIdProp || null);
  const [title, setTitle] = useState("Carte sans titre");
  const [activeTool, setActiveTool] = useState<EditorTool>("text");
  const [zoom, setZoom] = useState(100);
  const [selectedObject, setSelectedObject] = useState<FabricObject | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<string | undefined>();
  const [format, setFormat] = useState<CardFormat>(FORMATS[2]);
  const [pendingCanvasJson, setPendingCanvasJson] = useState<object | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  const { undo, redo, canUndo, canRedo, pushState, resetHistory } = useCanvasHistory(canvas);

  const [showShareModal, setShowShareModal] = useState(false);
  const [isOwner, setIsOwner] = useState(true);

  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);

  // Chargement d'une carte existante
  useEffect(() => {
    if (!cardIdProp) return;
    async function load() {
      try {
        const { card, isOwner: ownerFlag } = await getCardById(cardIdProp!);
        setCardId(card.id);
        setTitle(ownerFlag ? card.title : `${card.title} (reçue)`);
        setIsOwner(ownerFlag);
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
  }, [cardIdProp]);

  useEffect(() => {
    if (!canvas || !pendingCanvasJson) return;
    canvas.loadFromJSON(pendingCanvasJson).then(() => {
      canvas.renderAll();
      resetHistory();
      setPendingCanvasJson(null);
    });
  }, [canvas, pendingCanvasJson, resetHistory]);

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

  useEffect(() => {
    function handleBeforeUnload(e: BeforeUnloadEvent) {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  async function handleSave() {
    if (!canvas) return;
    setSaving(true);
    try {
      const canvasJson = canvas.toObject(["isSticker"]);
      const thumbnail = canvas.toDataURL({ format: "png", multiplier: 2 });

      if (!isOwner && cardId) {
        // Carte reçue : la première sauvegarde crée votre propre copie éditable
        const forked = await forkCardApi(cardId);
        setCardId(forked.id);
        setIsOwner(true);
        // Applique immédiatement les modifs en cours sur la copie fraîchement créée
        const { card } = await saveCard({
          cardId: forked.id, title, canvasJson, thumbnail,
          format: format.id, widthPx: format.widthPx, heightPx: format.heightPx,
        });
        setSavedAt(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));
        setIsDirty(false);
        onSaved?.(card);
        return card;
      }

      const { card } = await saveCard({
        cardId: cardId || undefined, title, canvasJson, thumbnail,
        format: format.id, widthPx: format.widthPx, heightPx: format.heightPx,
      });
      setCardId(card.id);
      setSavedAt(new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }));
      setIsDirty(false);
      onSaved?.(card);
      return card;
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'enregistrement");
    } finally {
      setSaving(false);
    }
  }

  function handleExport() {
    if (!canvas) return;
    const dataUrl = canvas.toDataURL({ format: "png", multiplier: 5 });
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `${title || "carte"}.png`;
    link.click();
  }

  function handleDeleteSelected() {
    if (!canvas || !selectedObject) return;
    canvas.remove(selectedObject);
    canvas.discardActiveObject();
    canvas.renderAll();
    setSelectedObject(null);
  }

  function handleBack() {
    if (isDirty) setShowUnsavedModal(true);
    else onClose();
  }

  async function handleSaveAndLeave() {
    await handleSave();
    setShowUnsavedModal(false);
    onClose();
  }

  function handleDiscardAndLeave() {
    setShowUnsavedModal(false);
    onClose();
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
        return null;
    }
  }

  const panelTitles: Record<EditorTool, string> = {
    format: "Format", text: "Texte", shapes: "Formes",
    stickers: "Stickers", images: "Images", background: "Fond",
  };

  function handlePreview() {
  if (!canvas) return;
  const dataUrl = canvas.toDataURL({ format: "png", multiplier: 2 });
  setPreviewDataUrl(dataUrl);
  setShowPreview(true);
}

  return (
    <div className="flex h-screen flex-col bg-white">
      <EditorHeader
        title={title}
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
        onBack={handleBack}
        onShare={() => setShowShareModal(true)}
        isOwner={isOwner}
        onPreview={handlePreview}
      />

      <div className="flex flex-1 overflow-hidden">
        <EditorSidebar activeTool={activeTool} onSelectTool={setActiveTool} />

        <div className={`relative flex flex-col border-r border-dark/10 bg-white transition-all duration-200 ${leftPanelCollapsed ? "w-0 overflow-hidden" : "w-72"}`}>
          <div className="flex items-center justify-between border-b border-dark/10 px-5 py-4">
            <h2 className="font-medium">{panelTitles[activeTool]}</h2>
          </div>
          {renderLeftPanel()}
        </div>

        <button
          onClick={() => setLeftPanelCollapsed((v) => !v)}
          className="z-10 flex h-8 w-5 items-center justify-center self-center rounded-r-lg border border-l-0 border-dark/10 bg-white text-dark/40 hover:text-coral"
        >
          {leftPanelCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        <div className="relative flex flex-1 items-center justify-center overflow-auto bg-dark/90 p-8">
          <div style={{ transform: `scale(${zoom / 100})` }}>
            <CardCanvas width={format.widthPx} height={format.heightPx} onReady={setCanvas} />
          </div>
          <ZoomControls zoom={zoom} onZoomChange={setZoom} />
        </div>

        <button
          onClick={() => setRightPanelCollapsed((v) => !v)}
          className="z-10 flex h-8 w-5 items-center justify-center self-center rounded-l-lg border border-r-0 border-dark/10 bg-white text-dark/40 hover:text-coral"
        >
          {rightPanelCollapsed ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        <div className={`overflow-hidden border-l border-dark/10 bg-white transition-all duration-200 ${rightPanelCollapsed ? "w-0" : "w-72"}`}>
          <PropertiesPanel
            canvas={canvas}
            selectedObject={selectedObject}
            onDelete={handleDeleteSelected}
            onChange={() => { pushState(); setIsDirty(true); }}
          />
        </div>
      </div>

      <UnsavedChangesModal
        open={showUnsavedModal}
        onSave={handleSaveAndLeave}
        onDiscard={handleDiscardAndLeave}
        onCancel={() => setShowUnsavedModal(false)}
        saving={saving}
      />

      {showShareModal && cardId && (
        <ShareModal cardId={cardId} onClose={() => setShowShareModal(false)} />
      )}

      {showPreview && (
        <CardPreviewModal
          thumbnailUrl={previewDataUrl}
          widthPx={format.widthPx}
          heightPx={format.heightPx}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}