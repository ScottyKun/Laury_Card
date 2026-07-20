"use client";

import { useEffect, useRef, useState } from "react";
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
import {
  ArrowLeft, ChevronLeft, ChevronRight,
  Undo2, Redo2, Eye, Share2, Download, Save,
} from "lucide-react";
import { useIsMobile } from "@/hooks/useIsMobile";
import MobileToolbar from "./mobileToolbar";

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
  onClose: () => void;
  onSaved?: (card: SavedCard) => void;
};

const panelTitles: Record<EditorTool, string> = {
  format: "Format", text: "Texte", shapes: "Formes",
  stickers: "Stickers", images: "Images", background: "Fond",
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

  // Panneaux desktop fermés par défaut
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(true);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(true);

  const isMobile = useIsMobile();
  const [mobileActiveTool, setMobileActiveTool] = useState<EditorTool | null>(null);

  // Dernier état connu du canvas, mis à jour en continu — permet de restaurer le contenu
  // si le canvas Fabric est démonté/remonté (ex: bascule mobile <-> desktop)
  const latestCanvasJsonRef = useRef<object | null>(null);
  const canvasScrollRef = useRef<HTMLDivElement>(null);

  // Zoom automatique à l'ouverture sur mobile (recalculé si le format change),
  // et retour à 100% par défaut en repassant sur desktop (symétrique, sinon le zoom
  // mobile restait figé même après être revenu sur grand écran)
  useEffect(() => {
    if (isMobile === null) return; // pas encore déterminé
    if (isMobile) {
      const availableWidth = window.innerWidth - 32; // marge de la zone canvas
      const availableHeight = window.innerHeight - 220; // header + barre du bas + marges
      const fit = Math.min(availableWidth / format.widthPx, availableHeight / format.heightPx, 1) * 100;
      setZoom(Math.max(20, Math.round(fit)));
    } else {
      setZoom(100);
    }
  }, [isMobile, format.widthPx, format.heightPx]);

  // Zoom natif Fabric : redimensionne réellement le canvas à la taille voulue,
  // au lieu d'un transform CSS externe qui devait coïncider parfaitement avec
  // plusieurs conteneurs imbriqués (source du bug de contenu tronqué).
  useEffect(() => {
    if (!canvas) return;
    const factor = zoom / 100;
    canvas.setZoom(factor);
    canvas.setDimensions({ width: format.widthPx * factor, height: format.heightPx * factor });
    canvas.renderAll();
  }, [canvas, zoom, format.widthPx, format.heightPx]);

  // Recentre le scroll à chaque changement de zoom (mobile) : sinon la position de scroll
  // précédente peut pointer hors de la carte une fois qu'elle a rétréci
  useEffect(() => {
    if (canvasScrollRef.current) {
      canvasScrollRef.current.scrollTop = 0;
      canvasScrollRef.current.scrollLeft = 0;
    }
  }, [zoom]);

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
    if (!canvas) return;
    function snapshot() {
      latestCanvasJsonRef.current = canvas!.toObject(["isSticker"]);
    }
    canvas.on("object:added", snapshot);
    canvas.on("object:modified", snapshot);
    canvas.on("object:removed", snapshot);
    return () => {
      canvas.off("object:added", snapshot);
      canvas.off("object:modified", snapshot);
      canvas.off("object:removed", snapshot);
    };
  }, [canvas]);

  useEffect(() => {
    if (!canvas) return;
    const jsonToLoad = pendingCanvasJson || latestCanvasJsonRef.current;
    if (!jsonToLoad) return;

    canvas.loadFromJSON(jsonToLoad).then(() => {
      canvas.renderAll();
      // Peuple immédiatement la ref (pas seulement après une édition) : garantit qu'un
      // basculement mobile/desktop juste après l'ouverture, sans aucune modification,
      // dispose déjà d'un contenu à restaurer.
      latestCanvasJsonRef.current = canvas.toObject(["isSticker"]);
      resetHistory();
      setPendingCanvasJson(null);
    });
    // Volontairement dépendant de pendingCanvasJson : le fetch réseau (getCardById) peut
    // se résoudre APRÈS le montage du canvas — sans cette dépendance, l'effet ne se
    // redéclencherait jamais et la carte resterait blanche.
  }, [canvas, pendingCanvasJson, resetHistory]);

  useEffect(() => {
    if (!canvas) return;
    const updateSelection = () => {
      const active = canvas.getActiveObject() || null;
      setSelectedObject(active);
      if (active && isMobile) setMobileActiveTool(null); // referme l'outil actif, le tiroir bascule sur les propriétés
    };
    canvas.on("selection:created", updateSelection);
    canvas.on("selection:updated", updateSelection);
    canvas.on("selection:cleared", () => setSelectedObject(null));
    return () => {
      canvas.off("selection:created", updateSelection);
      canvas.off("selection:updated", updateSelection);
      canvas.off("selection:cleared");
    };
  }, [canvas, isMobile]);

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
      const thumbnail = captureFullResolution(2);

      if (!isOwner && cardId) {
        const forked = await forkCardApi(cardId);
        setCardId(forked.id);
        setIsOwner(true);
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
    const dataUrl = captureFullResolution(5);
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

  function renderPanelFor(tool: EditorTool) {
    switch (tool) {
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

  function handlePreview() {
    if (!canvas) return;
    const dataUrl = captureFullResolution(2);
    setPreviewDataUrl(dataUrl);
    setShowPreview(true);
  }

  // --- Ferme le tiroir mobile (outil ou sélection) ---
  function closeMobileSheet() {
    setMobileActiveTool(null);
    if (selectedObject && canvas) {
      canvas.discardActiveObject();
      canvas.renderAll();
      setSelectedObject(null);
    }
  }

  const mobileSheetOpen = !!mobileActiveTool || !!selectedObject;
  const mobileSheetTitle = mobileActiveTool ? panelTitles[mobileActiveTool] : "Propriétés";

  // Capture toujours la carte à sa taille réelle (zoom 100%), quel que soit le zoom
  // d'affichage courant — sinon toDataURL() exporterait à la résolution du zoom actuel.
  function captureFullResolution(multiplier: number): string {
    if (!canvas) return "";
    const prevZoom = canvas.getZoom();
    const prevWidth = canvas.getWidth();
    const prevHeight = canvas.getHeight();

    canvas.setZoom(1);
    canvas.setDimensions({ width: format.widthPx, height: format.heightPx });
    canvas.renderAll();

    const dataUrl = canvas.toDataURL({ format: "png", multiplier });

    canvas.setZoom(prevZoom);
    canvas.setDimensions({ width: prevWidth, height: prevHeight });
    canvas.renderAll();

    return dataUrl;
  }

  if (isMobile === null) return null;

  if (isMobile) {
    return (
      <div className="relative flex h-screen flex-col bg-white">
        {/* Header compact : icônes seules, pas de texte */}
        <header className="flex h-14 items-center justify-between border-b border-dark/10 px-2">
          <div className="flex items-center gap-1">
            <button onClick={handleBack} className="rounded-lg p-2 text-dark/60 hover:bg-cream-dark hover:text-dark">
              <ArrowLeft size={19} />
            </button>
            <button onClick={undo} disabled={!canUndo} className="rounded-lg p-2 text-dark/50 hover:bg-cream-dark hover:text-dark disabled:opacity-30 disabled:hover:bg-transparent">
              <Undo2 size={17} />
            </button>
            <button onClick={redo} disabled={!canRedo} className="rounded-lg p-2 text-dark/50 hover:bg-cream-dark hover:text-dark disabled:opacity-30 disabled:hover:bg-transparent">
              <Redo2 size={17} />
            </button>
          </div>

          <p className="mx-1 flex-1 truncate text-center text-xs font-medium">{title}</p>

          <div className="flex items-center gap-1">
            <button onClick={handlePreview} className="rounded-lg p-2 text-dark/50 hover:bg-cream-dark hover:text-dark">
              <Eye size={17} />
            </button>
            <button
              onClick={() => (cardId ? setShowShareModal(true) : alert("Enregistrez la carte avant de la partager."))}
              className="rounded-lg p-2 text-coral-dark hover:bg-coral/10"
            >
              <Share2 size={17} />
            </button>
            <button onClick={handleExport} className="rounded-lg p-2 text-dark/50 hover:bg-cream-dark hover:text-dark">
              <Download size={17} />
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center justify-center rounded-full bg-coral p-2 text-white hover:bg-coral-dark disabled:opacity-60"
            >
              <Save size={16} />
            </button>
          </div>
        </header>

        {!isOwner && (
          <div className="border-b border-coral/20 bg-coral/5 px-3 py-1.5 text-center text-[11px] font-medium text-coral">
            Reçue — enregistrer pour garder une copie
          </div>
        )}

        {/* Zone canvas : Fabric gère lui-même sa taille réelle (zoom natif), w-fit + mx-auto
            centre correctement sans le bug de scroll bloqué des flex items-center/justify-center */}
        <div ref={canvasScrollRef} className="relative flex-1 overflow-auto bg-dark/90 p-4">
          <div className="w-fit mx-auto">
            <CardCanvas width={format.widthPx} height={format.heightPx} onReady={setCanvas} />
          </div>
        </div>

        {/* Zoom en position fixe, en bas (jamais au niveau du header) : ne recouvre jamais d'autres boutons */}
        <div className="fixed bottom-20 right-3 z-40">
          <ZoomControls zoom={zoom} onZoomChange={setZoom} />
        </div>

        <MobileToolbar
          activeTool={mobileActiveTool}
          onSelectTool={setMobileActiveTool}
          sheetOpen={mobileSheetOpen}
          sheetTitle={mobileSheetTitle}
          onCloseSheet={closeMobileSheet}
        >
          {mobileActiveTool
            ? renderPanelFor(mobileActiveTool)
            : selectedObject && (
                <PropertiesPanel
                  canvas={canvas}
                  selectedObject={selectedObject}
                  onDelete={handleDeleteSelected}
                  onChange={() => { pushState(); setIsDirty(true); }}
                />
              )}
        </MobileToolbar>

        <UnsavedChangesModal open={showUnsavedModal} onSave={handleSaveAndLeave} onDiscard={handleDiscardAndLeave} onCancel={() => setShowUnsavedModal(false)} saving={saving} />

        {showShareModal && cardId && <ShareModal cardId={cardId} onClose={() => setShowShareModal(false)} />}

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

  // --- Desktop ---
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
        <EditorSidebar activeTool={activeTool} onSelectTool={(tool) => { setActiveTool(tool); setLeftPanelCollapsed(false); }} />

        <div className={`relative flex flex-col border-r border-dark/10 bg-white transition-all duration-200 ${leftPanelCollapsed ? "w-0 overflow-hidden" : "w-72"}`}>
          <div className="flex items-center justify-between border-b border-dark/10 px-5 py-4">
            <h2 className="font-medium">{panelTitles[activeTool]}</h2>
          </div>
          {renderPanelFor(activeTool)}
        </div>

        <button
          onClick={() => setLeftPanelCollapsed((v) => !v)}
          className="z-10 flex h-8 w-5 items-center justify-center self-center rounded-r-lg border border-l-0 border-dark/10 bg-white text-dark/40 hover:text-coral"
        >
          {leftPanelCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Zone canvas : Fabric gère lui-même sa taille réelle (zoom natif) */}
        <div className="relative flex-1 overflow-auto bg-dark/90 p-8">
          <div className="w-fit mx-auto">
            <CardCanvas width={format.widthPx} height={format.heightPx} onReady={setCanvas} />
          </div>
          <div className="absolute bottom-6 right-6">
            <ZoomControls zoom={zoom} onZoomChange={setZoom} />
          </div>
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

      {showShareModal && cardId && <ShareModal cardId={cardId} onClose={() => setShowShareModal(false)} />}

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