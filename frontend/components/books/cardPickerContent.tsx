import { Plus } from "lucide-react";
import { CardSummary } from "@/lib/api";

type Props = {
  availableCards: CardSummary[];
  replaceTargetIndex: number | null;
  onSelectCard: (card: CardSummary) => void;
  onCreateCard: () => void;
  onCancelReplace: () => void;
};

export default function CardPickerContent({
  availableCards, replaceTargetIndex, onSelectCard, onCreateCard, onCancelReplace,
}: Props) {
  return (
    <>
      <button
        onClick={onCreateCard}
        className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-dark/15 py-3 text-sm text-dark/60 hover:border-coral hover:text-coral"
      >
        <Plus size={16} /> Créer une carte
      </button>

      {replaceTargetIndex !== null && (
        <div className="mb-3 flex items-center justify-between rounded-lg bg-coral/10 px-3 py-2 text-xs text-coral-dark">
          Sélectionnez une carte pour remplacer la page {replaceTargetIndex + 1}
          <button onClick={onCancelReplace} className="font-medium underline">Annuler</button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {availableCards.map((card) => (
          <button
            key={card.id}
            onClick={() => onSelectCard(card)}
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