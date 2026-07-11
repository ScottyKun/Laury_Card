import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-coral text-white font-serif text-lg">
        C
      </span>
      <span className="font-serif text-lg">
        Cartes<span className="text-coral">&</span>Mots
      </span>
    </Link>
  );
}