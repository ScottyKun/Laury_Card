import Link from "next/link";
import { Plus, BookOpen } from "lucide-react";

type Props = {
  firstName?: string;
  onCreateBook: () => void;
};

export default function GreetingBanner({ firstName, onCreateBook }: Props) {
  return (
    <div className="relative mx-6 mt-6 overflow-hidden rounded-2xl border border-dark/5 bg-gradient-to-r from-coral/10 via-coral-light/5 to-transparent px-8 py-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="font-serif text-2xl">Bonjour, {firstName || "vous"} ✨</h1>
          <p className="mt-1 text-dark/60">Envie de créer de magnifiques souvenirs aujourd&apos;hui ?</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button onClick={onCreateBook} className="flex w-full items-center justify-center gap-2 rounded-full border border-coral/30 bg-white px-5 py-3 text-sm font-medium text-coral hover:bg-coral/5 sm:w-auto">
            <BookOpen size={18} /> Nouveau livre
          </button>
          <Link href="/create" className="flex w-full items-center justify-center gap-2 rounded-full bg-coral px-5 py-3 text-sm font-medium text-white hover:bg-coral-dark sm:w-auto">
            <Plus size={18} /> Nouvelle carte
          </Link>
        </div>
      </div>
    </div>
  );
}