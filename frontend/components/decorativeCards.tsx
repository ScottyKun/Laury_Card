"use client";

const cards = [
  {
    gradient: "from-violet-200 to-violet-100",
    rotate: "rotate-[-10deg]",
    z: "z-0",
    content: { emoji: "💍", title: "Elle a dit oui", tag: "Pour la vie, à deux" },
  },
  {
    gradient: "from-sky-200 to-sky-100",
    rotate: "rotate-[-4deg]",
    z: "z-10",
    content: { emoji: "💌", title: "Mon amour", tag: "Chaque jour avec toi" },
  },
  {
    gradient: "from-coral-light to-cream",
    rotate: "rotate-[4deg]",
    z: "z-20",
    content: { emoji: "🎂", title: "Joyeux Anniversaire", tag: "Avec tout mon amour" },
  },
];

export default function DecorativeCards() {
  return (
    <div className="relative hidden h-80 items-center justify-center md:flex">
      {cards.map((card, i) => (
        <div
          key={i}
          className={`absolute h-64 w-48 ${card.rotate} ${card.z} rounded-2xl bg-gradient-to-br ${card.gradient} shadow-lg transition-shadow duration-300 ease-out hover:z-30 hover:shadow-2xl`}
        >
          <div className="flex h-full w-full flex-col items-center justify-center gap-4 p-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-coral">
              ✦
            </span>
            <p className="font-script text-xl">{card.content.title}</p>
            <span className="rounded-full bg-white/80 px-3 py-1 text-xs text-center">
              {card.content.emoji} {card.content.tag}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}