import type { Metadata } from "next";
import { Inter, Playfair_Display, Caveat } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-heading",
});

const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-hand",
});

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
      className={`${inter.variable} ${playfair.variable} ${caveat.variable}`}
      data-scroll-behavior="smooth"
    >
      <body className="bg-cream text-dark font-sans">
        {children}
      </body>
    </html>
  );
}

