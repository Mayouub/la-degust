import type { Metadata } from "next";
import { Anton, Caveat, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const anton = Anton({
  variable: "--font-anton",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "La Dégust' du Grand Coin",
    template: "%s | La Dégust' du Grand Coin",
  },
  description:
    "Dégustation d'huîtres en direct du producteur, au cœur du marais poitevin vendéen. Réservation en ligne et Click & Collect.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ladegustdugrandcoin.fr"
  ),
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${inter.variable} ${anton.variable} ${caveat.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
