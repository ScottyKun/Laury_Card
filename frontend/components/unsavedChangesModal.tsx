"use client";

type Props = {
  open: boolean;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
  saving?: boolean;
};

export default function UnsavedChangesModal({ open, onSave, onDiscard, onCancel, saving }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="font-serif text-xl">Modifications non enregistrées</h2>
        <p className="mt-2 text-sm text-dark/60">
          Vous avez des changements qui n&apos;ont pas été enregistrés. Voulez-vous les enregistrer avant de quitter ?
        </p>

        <div className="mt-6 flex flex-col gap-2">
          <button onClick={onSave} disabled={saving} className="rounded-full bg-coral py-2.5 text-sm font-medium text-white hover:bg-coral-dark disabled:opacity-60">
            {saving ? "Enregistrement..." : "Enregistrer et quitter"}
          </button>
          <button onClick={onDiscard} className="rounded-full border border-dark/10 py-2.5 text-sm font-medium hover:bg-cream-dark">
            Quitter sans enregistrer
          </button>
          <button onClick={onCancel} className="py-2 text-sm text-dark/50 hover:text-dark">
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}