const decorativeNotes = [
  { text: "Joyeux\nAnniversaire", emoji: "🎉", position: "left-4 top-8 -rotate-6", bg: "bg-rose-100" },
  { text: "Merci", emoji: "💙", position: "left-4 bottom-20 rotate-3", bg: "bg-sky-100" },
  { text: "Félicitations", emoji: "🎊", position: "right-4 bottom-8 rotate-6", bg: "bg-violet-100" },
];

export default function AuthPanel() {
  return (
    <div className="relative hidden w-1/2 flex-col items-center justify-center overflow-hidden bg-dark px-12 text-white lg:flex">
      {decorativeNotes.map((note, i) => (
        <div
          key={i}
          className={`absolute ${note.position} ${note.bg} flex h-40 w-36 flex-col items-center justify-center gap-2 rounded-lg p-4 text-dark shadow-lg whitespace-pre-line font-script text-xl`}
        >
          <span className="text-2xl">{note.emoji}</span>
          {note.text}
        </div>
      ))}

      <div className="z-10 flex flex-col items-center gap-4 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-coral font-serif text-2xl">
          C
        </span>
        <h1 className="font-script text-4xl">Cartes&Mots</h1>
        <p className="max-w-xs text-white/70">
          Votre espace créatif pour des cartes et livres virtuels qui touchent le cœur.
        </p>

        <ul className="mt-4 space-y-2 text-left text-sm text-white/80">
          <li className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-coral" /> Éditeur intuitif par glisser-déposer
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-coral" /> Polices et thèmes personnalisables
          </li>
          <li className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-coral" /> Albums et livres animés
          </li>
        </ul>
      </div>
    </div>
  );
}