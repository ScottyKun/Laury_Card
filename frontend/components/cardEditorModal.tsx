"use client";

import CardEditor from "./cardEditor";

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
  onSaved: (card: SavedCard) => void;
};

export default function CardEditorModal({ cardId, onClose, onSaved }: Props) {
  return (
    <div className="fixed inset-0 z-50">
      <CardEditor cardId={cardId} onClose={onClose} onSaved={onSaved} />
    </div>
  );
}