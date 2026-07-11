import Link from "next/link";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import DecorativeCards from "@/components/decorativeCards";

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden">
      <div className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-coral/20 blur-3xl" />
      <div className="pointer-events-none absolute -left-32 bottom-0 h-[400px] w-[400px] rounded-full bg-coral-light/10 blur-3xl" />
      <Navbar />

      <main className="flex flex-1 items-center">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-6 md:grid-cols-2 md:px-12">
          {/* Texte */}
          <div className="flex flex-col justify-center gap-6">
            <span className="w-fit rounded-full bg-coral/10 px-4 py-1.5 text-sm text-coral">
              ✦ Créez, personnalisez, partagez
            </span>

            <h1 className="font-serif text-4xl leading-tight md:text-5xl">
              Des cartes qui{" "}
              <span className="font-script text-coral text-5xl md:text-6xl">
                touchent le cœur
              </span>
            </h1>

            <p className="max-w-md text-dark/70">
              Votre espace créatif pour concevoir des cartes virtuelles uniques
              et les assembler en livres souvenirs.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/create"
                className="rounded-full bg-coral px-6 py-3 text-center font-medium text-white transition hover:bg-coral-dark"
              >
                Créer ma première carte →
              </Link>
              <Link
                href="/login"
                className="rounded-full border border-dark/10 bg-white px-6 py-3 text-center font-medium text-dark transition hover:bg-cream-dark"
              >
                Se connecter
              </Link>
            </div>
          </div>

          <DecorativeCards />
          
        </div>
      </main>

      <Footer />
    </div>
  );
}