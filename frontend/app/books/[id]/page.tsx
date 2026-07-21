"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Plus, X, Eye, Save, Copy, RefreshCw, Pencil,
  Share2, Download, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Image as ImageIcon,
} from "lucide-react";
import { getBookById, updateBookApi, getCards, CardSummary, BookPage, exportBookPdf } from "@/lib/api";
import BookPreview from "@/components/books/bookPreview";
import CardEditorModal from "@/components/cardEditorModal";
import UnsavedChangesModal from "@/components/unsavedChangesModal";
import ShareModal from "@/components/shareModal";
import { useIsMobile } from "@/hooks/useIsMobile";

type LocalPage = {
  cardId: string;
  cardTitle: string;
  thumbnailUrl: string | null;
  widthPx: number;
  heightPx: number;
  transitionType: "fade" | "slide" | "flip" | "none" | "zoom" | "rotate";
};

const transitionLabels: Record<LocalPage["transitionType"], string> = {
  fade: "Fondu",
  slide: "Glissement",
  flip: "Flip",
  zoom: "Zoom",
  rotate: "Rotation",
  none: "Aucune",
};

export default function BookEditorPage() {
  const params = useParams();
  const router = useRouter();
  const bookId = params.id as string;
  const isMobile = useIsMobile();

  const [title, setTitle] = useState("Livre sans titre");
  const [editingTitle, setEditingTitle] = useState(false);
  const [pages, setPages] = useState<LocalPage[]>([]);
  const [availableCards, setAvailableCards] = useState<CardSummary[]>([]);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const [editorState, setEditorState] = useState<{ open: boolean; cardId?: string; targetPageIndex?: number }>({ open: false });
  const [replaceTargetIndex, setReplaceTargetIndex] = useState<number | null>(null);

  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);

  const [showShareModal, setShowShareModal] = useState(false);

  const [exporting, setExporting] = useState(false);

  // Panneau "Mes cartes" rétractable (chevron sur desktop, plein écran sur mobile)
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [{ book, pages: bookPages }, cards] = await Promise.all([getBookById(bookId), getCards()]);
        setTitle(book.title);
        setPages(
          bookPages.map((p: BookPage) => ({
            cardId: p.card_id,
            cardTitle: p.card_title,
            thumbnailUrl: p.thumbnail_url,
            widthPx: p.width_px,
            heightPx: p.height_px,
            transitionType: p.transition_type,
          }))
        );
        setAvailableCards(cards);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [bookId]);

  function addCard(card: CardSummary) {
    if (replaceTargetIndex !== null) {
      setPages((prev) =>
        prev.map((p, i) =>
          i === replaceTargetIndex
            ? { ...p, cardId: card.id, cardTitle: card.title, thumbnailUrl: card.thumbnail_url, widthPx: card.width_px, heightPx: card.height_px }
            : p
        )
      );
      setReplaceTargetIndex(null);
      setIsDirty(true);
      if (isMobile) setLeftPanelCollapsed(true);
      return;
    }

    setPages((prev) => [
      ...prev,
      { cardId: card.id, cardTitle: card.title, thumbnailUrl: card.thumbnail_url, widthPx: card.width_px, heightPx: card.height_px, transitionType: "fade" },
    ]);
    setIsDirty(true);
    if (isMobile) setLeftPanelCollapsed(true); // referme l'overlay après ajout, retour direct sur l'assemblage
  }

  function removePage(index: number) {
    if (!confirm("Supprimer cette page du livre ?")) return;
    setPages((prev) => prev.filter((_, i) => i !== index));
    setIsDirty(true);
  }

  function setTransition(index: number, transitionType: LocalPage["transitionType"]) {
    setPages((prev) => prev.map((p, i) => (i === index ? { ...p, transitionType } : p)));
    setIsDirty(true);
  }

  function handleDragStart(index: number) {
    setDragIndex(index);
  }

  function handleDrop(index: number) {
    if (dragIndex === null || dragIndex === index) return;
    setPages((prev) => {
      const next = [...prev];
      const [moved] = next.splice(dragIndex, 1);
      next.splice(index, 0, moved);
      return next;
    });
    setDragIndex(null);
    setIsDirty(true);
  }

  // Alternative au drag & drop pour le tactile (peu fiable au toucher) : réorganisation par boutons
  function movePage(index: number, direction: -1 | 1) {
    setPages((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setIsDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateBookApi(bookId, {
        title,
        pages: pages.map((p) => ({ cardId: p.cardId, transitionType: p.transitionType })),
      });
      setIsDirty(false);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
    }
  }

  function openCreateCard() {
    setEditorState({ open: true, cardId: undefined, targetPageIndex: undefined });
  }

  function openEditCard(cardId: string, pageIndex: number) {
    setEditorState({ open: true, cardId, targetPageIndex: pageIndex });
  }

  function handleEditorSaved(card: {
    id: string; title: string; thumbnail_url: string | null; format: string; width_px: number; height_px: number;
  }) {
    if (editorState.targetPageIndex !== undefined) {
      setPages((prev) =>
        prev.map((p, i) =>
          i === editorState.targetPageIndex
            ? { ...p, cardTitle: card.title, thumbnailUrl: card.thumbnail_url, widthPx: card.width_px, heightPx: card.height_px }
            : p
        )
      );
    } else {
      setPages((prev) => [
        ...prev,
        {
          cardId: card.id,
          cardTitle: card.title,
          thumbnailUrl: card.thumbnail_url,
          widthPx: card.width_px,
          heightPx: card.height_px,
          transitionType: "fade",
        },
      ]);
    }
    setIsDirty(true);
    getCards().then(setAvailableCards).catch(console.error);
  }

  function duplicatePage(index: number) {
    setPages((prev) => {
      const copy = { ...prev[index] };
      const next = [...prev];
      next.splice(index + 1, 0, copy);
      return next;
    });
    setIsDirty(true);
  }

  function startReplace(index: number) {
    setReplaceTargetIndex(index);
    if (isMobile) setLeftPanelCollapsed(false); // ouvre l'overlay de sélection sur mobile
  }

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

  async function handleExport() {
    setExporting(true);
    try {
      await exportBookPdf(bookId, title);
    } catch (err) {
      console.error(err);
      alert(err instanceof Error ? err.message : "Erreur lors de l'export");
    } finally {
      setExporting(false);
    }
  }

  // --- Contenu du panneau "Mes cartes", partagé entre la version desktop (colonne) et mobile (overlay) ---
  function CardPickerContent() {
    return (
      <>
        <button
          onClick={openCreateCard}
          className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-dark/15 py-3 text-sm text-dark/60 hover:border-coral hover:text-coral"
        >
          <Plus size={16} /> Créer une carte
        </button>

        {replaceTargetIndex !== null && (
          <div className="mb-3 flex items-center justify-between rounded-lg bg-coral/10 px-3 py-2 text-xs text-coral-dark">
            Sélectionnez une carte pour remplacer la page {replaceTargetIndex + 1}
            <button onClick={() => setReplaceTargetIndex(null)} className="font-medium underline">Annuler</button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {availableCards.map((card) => (
            <button
              key={card.id}
              onClick={() => addCard(card)}
              className="group relative overflow-hidden rounded-lg border border-dark/10 hover:border-coral"
              style={{ aspectRatio: `${card.width_px} / ${card.height_px}` }}
            >
              {card.thumbnail_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={card.thumbnail_url} alt={card.title} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-cream-dark" />
              )}
              <div className="absolute inset-0 flex items-center justify-center bg-dark/0 opacity-0 transition group-hover:bg-dark/30 group-hover:opacity-100">
                <Plus className="text-white" size={20} />
              </div>
            </button>
          ))}
        </div>
      </>
    );
  }

  const headerSubtitle = `${pages.length} page${pages.length > 1 ? "s" : ""} · ~${pages.length * 4}s de lecture`;

  if (isMobile === null) return null;

  return (
    <div className="flex h-screen flex-col">
      {isMobile ? (
        // --- Header mobile compact : icônes seules ---
        <header className="flex h-14 items-center justify-between border-b border-dark/10 bg-cream-dark px-2">
          <div className="flex items-center gap-1">
            <button onClick={handleBack} className="rounded-lg p-2 text-dark/60 hover:bg-white">
              <ArrowLeft size={19} />
            </button>
            <button
              onClick={() => setLeftPanelCollapsed((v) => !v)}
              className="rounded-lg p-2 text-dark/60 hover:bg-white"
              title="Mes cartes"
            >
              <ImageIcon size={18} />
            </button>
          </div>

          {editingTitle ? (
            <input
              autoFocus
              value={title}
              onChange={(e) => { setTitle(e.target.value); setIsDirty(true); }}
              onBlur={() => setEditingTitle(false)}
              onKeyDown={(e) => e.key === "Enter" && setEditingTitle(false)}
              className="mx-1 flex-1 rounded-md border border-coral bg-white px-2 py-1 text-center text-xs font-medium outline-none"
            />
          ) : (
            <p onClick={() => setEditingTitle(true)} className="mx-1 flex-1 truncate text-center text-xs font-medium">
              {title}
            </p>
          )}

          <div className="flex items-center gap-1">
            <button onClick={() => setPreviewOpen(true)} disabled={pages.length === 0} className="rounded-lg p-2 text-dark/50 hover:bg-white disabled:opacity-30">
              <Eye size={17} />
            </button>
            <button onClick={() => setShowShareModal(true)} className="rounded-lg p-2 text-coral-dark hover:bg-coral/10">
              <Share2 size={17} />
            </button>
            <button onClick={handleExport} disabled={exporting || pages.length === 0} className="rounded-lg p-2 text-dark/50 hover:bg-white disabled:opacity-30">
              <Download size={17} />
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center justify-center rounded-full bg-coral p-2 text-white disabled:opacity-60"
            >
              <Save size={16} />
            </button>
          </div>
        </header>
      ) : (
        // --- Header desktop, inchangé ---
        <header className="flex h-16 items-center justify-between border-b border-dark/10 bg-cream-dark px-4">
          <div className="flex items-center gap-4">
            <button onClick={handleBack} className="rounded-lg p-2 text-dark/60 hover:bg-white hover:text-dark">
              <ArrowLeft size={20} />
            </button>
            {editingTitle ? (
              <input
                autoFocus
                value={title}
                onChange={(e) => { setTitle(e.target.value); setIsDirty(true); }}
                onBlur={() => setEditingTitle(false)}
                onKeyDown={(e) => e.key === "Enter" && setEditingTitle(false)}
                className="rounded-md border border-coral bg-white px-2 py-1 text-sm font-medium outline-none"
              />
            ) : (
              <p onClick={() => setEditingTitle(true)} className="cursor-text rounded-md px-2 py-1 text-sm font-medium hover:bg-white/60">
                {title}
              </p>
            )}
            <p className="px-2 text-xs text-dark/50">{headerSubtitle}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setPreviewOpen(true)}
              disabled={pages.length === 0}
              className="flex items-center gap-2 rounded-full border border-dark/10 px-4 py-2 text-sm font-medium hover:bg-white disabled:opacity-50"
            >
              <Eye size={16} /> Aperçu
            </button>
            <button
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 rounded-full bg-coral-light/20 px-4 py-2 text-sm font-medium text-coral-dark hover:bg-coral-light/30"
            >
              <Share2 size={16} /> Partager
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-full bg-coral px-4 py-2 text-sm font-medium text-white hover:bg-coral-dark disabled:opacity-60"
            >
              <Save size={16} /> {saving ? "Enregistrement..." : "Enregistrer"}
            </button>
            <button
              onClick={handleExport}
              disabled={exporting || pages.length === 0}
              className="flex items-center gap-2 rounded-full bg-coral px-4 py-2 text-sm font-medium text-white hover:bg-coral-dark disabled:opacity-50"
            >
              <Download size={16} /> {exporting ? "Export..." : "Exporter PDF"}
            </button>
          </div>
        </header>
      )}

      <div className="relative flex flex-1 overflow-hidden">
        {isMobile ? (
          // --- Mobile : le panneau "Mes cartes" est un overlay plein écran, pas une colonne ---
          leftPanelCollapsed ? null : (
            <div className="fixed inset-0 z-50 flex flex-col bg-white">
              <div className="flex items-center justify-between border-b border-dark/10 px-4 py-3">
                <h2 className="font-medium">Mes cartes</h2>
                <button onClick={() => setLeftPanelCollapsed(true)} className="rounded-lg p-1.5 text-dark/40 hover:bg-cream-dark">
                  <X size={18} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <CardPickerContent />
              </div>
            </div>
          )
        ) : (
          <>
            {/* Desktop : colonne rétractable avec chevron */}
            <div className={`overflow-hidden border-r border-dark/10 bg-white transition-all duration-200 ${leftPanelCollapsed ? "w-0" : "w-80"}`}>
              <div className="h-full overflow-y-auto p-5">
                <h2 className="mb-4 font-medium">Mes cartes</h2>
                <CardPickerContent />
              </div>
            </div>

            <button
              onClick={() => setLeftPanelCollapsed((v) => !v)}
              className="z-10 flex h-8 w-5 items-center justify-center self-center rounded-r-lg border border-l-0 border-dark/10 bg-white text-dark/40 hover:text-coral"
            >
              {leftPanelCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>
          </>
        )}

        {/* Pages du livre — réordonnables */}
        <div className="flex-1 overflow-y-auto bg-cream-dark p-4 md:p-6">
          {isMobile && (
            <p className="mb-3 text-xs text-dark/50">{headerSubtitle}</p>
          )}

          {pages.length === 0 ? (
            <p className="py-10 text-center text-dark/40">
              {isMobile
                ? "Touchez l'icône image en haut pour ajouter une carte à votre livre."
                : "Clique sur une carte à gauche pour l'ajouter à ton livre."}
            </p>
          ) : (
            <div className={`grid gap-4 md:gap-6 ${isMobile ? "grid-cols-1" : "grid-cols-2 lg:grid-cols-3"}`}>
              {pages.map((page, index) => (
                <div
                  key={`${page.cardId}-${index}`}
                  draggable={!isMobile}
                  onDragStart={() => !isMobile && handleDragStart(index)}
                  onDragOver={(e) => !isMobile && e.preventDefault()}
                  onDrop={() => !isMobile && handleDrop(index)}
                  className={`flex flex-col overflow-hidden rounded-xl bg-white shadow-sm ${!isMobile ? "cursor-grab active:cursor-grabbing" : ""}`}
                >
                  <div className="relative">
                    <span className="absolute left-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-dark/70 text-xs font-medium text-white">
                      {index + 1}
                    </span>
                    <div className="absolute right-2 top-2 z-10 flex gap-1">
                      <button
                        onClick={() => startReplace(index)}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-dark/60 hover:bg-coral/10 hover:text-coral"
                        title="Remplacer la carte"
                      >
                        <RefreshCw size={12} />
                      </button>
                      <button
                        onClick={() => openEditCard(page.cardId, index)}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-dark/60 hover:bg-coral/10 hover:text-coral"
                        title="Modifier la carte"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        onClick={() => duplicatePage(index)}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-dark/60 hover:bg-coral/10 hover:text-coral"
                        title="Dupliquer la page"
                      >
                        <Copy size={12} />
                      </button>
                      <button
                        onClick={() => removePage(index)}
                        className="flex h-6 w-6 items-center justify-center rounded-full bg-white/90 text-dark/60 hover:bg-red-50 hover:text-red-500"
                        title="Supprimer la page"
                      >
                        <X size={13} />
                      </button>
                    </div>
                    <div style={{ aspectRatio: `${page.widthPx} / ${page.heightPx}` }} className="overflow-hidden bg-cream">
                      {page.thumbnailUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={page.thumbnailUrl} alt={page.cardTitle} className="h-full w-full object-cover" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3">
                    {isMobile && (
                      <div className="flex flex-col gap-0.5">
                        <button
                          onClick={() => movePage(index, -1)}
                          disabled={index === 0}
                          className="rounded p-0.5 text-dark/40 hover:text-coral disabled:opacity-20"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          onClick={() => movePage(index, 1)}
                          disabled={index === pages.length - 1}
                          className="rounded p-0.5 text-dark/40 hover:text-coral disabled:opacity-20"
                        >
                          <ChevronDown size={14} />
                        </button>
                      </div>
                    )}
                    <select
                      value={page.transitionType}
                      onChange={(e) => setTransition(index, e.target.value as LocalPage["transitionType"])}
                      className="w-full flex-1 rounded-lg border border-dark/10 px-2 py-1.5 text-xs"
                    >
                      {Object.entries(transitionLabels).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {previewOpen && (
        <BookPreview
          pages={pages.map((p) => ({
            thumbnailUrl: p.thumbnailUrl,
            widthPx: p.widthPx,
            heightPx: p.heightPx,
            transitionType: p.transitionType,
          }))}
          onClose={() => setPreviewOpen(false)}
        />
      )}

      {editorState.open && (
        <CardEditorModal
          cardId={editorState.cardId}
          onClose={() => setEditorState({ open: false })}
          onSaved={handleEditorSaved}
        />
      )}

      <UnsavedChangesModal
        open={showUnsavedModal}
        onSave={handleSaveAndLeave}
        onDiscard={handleDiscardAndLeave}
        onCancel={() => setShowUnsavedModal(false)}
        saving={saving}
      />

      {showShareModal && <ShareModal bookId={bookId} onClose={() => setShowShareModal(false)} />}
    </div>
  );
}