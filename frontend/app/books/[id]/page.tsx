"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, X, Eye, Save, Copy, RefreshCw } from "lucide-react";
import { getBookById, updateBookApi, getCards, CardSummary, BookPage, exportBookPdf } from "@/lib/api";
import BookPreview from "@/components/books/bookPreview";
import { Pencil } from "lucide-react";
import CardEditorModal from "@/components/cardEditorModal";
import UnsavedChangesModal from "@/components/unsavedChangesModal";
import ShareModal from "@/components/shareModal";
import { Share2 } from "lucide-react";
import { Download } from "lucide-react";

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

  useEffect(() => {
    async function load() {
      try {
        const [{ book, pages: bookPages }, cards, ] = await Promise.all([getBookById(bookId), getCards()]);
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
        return;
    }

    setPages((prev) => [
        ...prev,
        { cardId: card.id, cardTitle: card.title, thumbnailUrl: card.thumbnail_url, widthPx: card.width_px, heightPx: card.height_px, transitionType: "fade" },
    ]);
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
    // Si on éditait une page existante : met à jour cette page en place
    if (editorState.targetPageIndex !== undefined) {
        setPages((prev) =>
        prev.map((p, i) =>
            i === editorState.targetPageIndex
            ? { ...p, cardTitle: card.title, thumbnailUrl: card.thumbnail_url, widthPx: card.width_px, heightPx: card.height_px }
            : p
        )
        );
    } else {
        // Nouvelle carte créée depuis le livre : on l'ajoute directement comme nouvelle page
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

    // Rafraîchit aussi la liste "mes cartes" à gauche (pour retrouver la carte modifiée/créée)
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

  return (
    <div className="flex h-screen flex-col">
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
          <p className="px-2 text-xs text-dark/50">
            {pages.length} page{pages.length > 1 ? "s" : ""} · ~{pages.length * 4}s de lecture
          </p>
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

      <div className="flex flex-1 overflow-hidden">
        {/* Sélection des cartes disponibles */}
        <div className="w-80 overflow-y-auto border-r border-dark/10 bg-white p-5">
          <h2 className="mb-4 font-medium">Mes cartes</h2>
           <button
                onClick={openCreateCard}
                className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-dark/15 py-3 text-sm text-dark/60 hover:border-coral hover:text-coral"
            >
                <Plus size={16} /> Créer une carte
            </button>
          <div className="grid grid-cols-2 gap-3">
            {replaceTargetIndex !== null && (
                <div className="mb-3 flex items-center justify-between rounded-lg bg-coral/10 px-3 py-2 text-xs text-coral-dark">
                    Sélectionnez une carte pour remplacer la page {replaceTargetIndex + 1}
                    <button onClick={() => setReplaceTargetIndex(null)} className="font-medium underline">Annuler</button>
                </div>
            )}
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
        </div>

        {/* Pages du livre — réordonnables */}
        <div className="flex-1 overflow-y-auto bg-cream-dark p-6">
          {pages.length === 0 ? (
            <p className="py-10 text-center text-dark/40">
              Clique sur une carte à gauche pour l&apos;ajouter à ton livre.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-3">
              {pages.map((page, index) => (
                <div
                  key={`${page.cardId}-${index}`}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => handleDrop(index)}
                  className="flex cursor-grab flex-col overflow-hidden rounded-xl bg-white shadow-sm active:cursor-grabbing"
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

                  <div className="p-3">
                    <select
                    value={page.transitionType}
                    onChange={(e) => setTransition(index, e.target.value as LocalPage["transitionType"])}
                    className="w-full rounded-lg border border-dark/10 px-2 py-1.5 text-xs"
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

      {showShareModal && (
        <ShareModal bookId={bookId} onClose={() => setShowShareModal(false)} />
      )}
    </div>
  );
}