import type { Metadata } from "next";
import {
  Inter,
  Playfair_Display,
  Caveat,
  Poppins,
  Montserrat,
  Quicksand,
  Nunito,
  Lora,
  Merriweather,
  Dancing_Script,
  Pacifico,
  Indie_Flower,
  Great_Vibes,
  Roboto_Slab,
  Abril_Fatface,
} from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-heading" });
const caveat = Caveat({ subsets: ["latin"], variable: "--font-hand" });
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "600", "700"], variable: "--font-poppins" });
const montserrat = Montserrat({ subsets: ["latin"], variable: "--font-montserrat" });
const quicksand = Quicksand({ subsets: ["latin"], variable: "--font-quicksand" });
const nunito = Nunito({ subsets: ["latin"], variable: "--font-nunito" });
const lora = Lora({ subsets: ["latin"], variable: "--font-lora" });
const merriweather = Merriweather({ subsets: ["latin"], weight: ["400", "700"], variable: "--font-merriweather" });
const dancingScript = Dancing_Script({ subsets: ["latin"], variable: "--font-dancing" });
const pacifico = Pacifico({ subsets: ["latin"], weight: "400", variable: "--font-pacifico" });
const indieFlower = Indie_Flower({ subsets: ["latin"], weight: "400", variable: "--font-indie" });
const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400", variable: "--font-great-vibes" });
const robotoSlab = Roboto_Slab({ subsets: ["latin"], variable: "--font-roboto-slab" });

export const metadata: Metadata = {
  title: "Cartes&Mots",
  description: "Votre espace créatif pour des cartes et livres virtuels qui touchent le cœur.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="fr"
      className={`${inter.variable} ${playfair.variable} ${caveat.variable} ${poppins.variable} ${montserrat.variable} ${quicksand.variable} ${nunito.variable} ${lora.variable} ${merriweather.variable} ${dancingScript.variable} ${pacifico.variable} ${indieFlower.variable} ${greatVibes.variable} ${robotoSlab.variable}`}
      data-scroll-behavior="smooth"
    >
      <body className="bg-cream text-dark font-sans">
        {children}
      </body>
    </html>
  );
}

