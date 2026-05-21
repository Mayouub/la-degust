import { Suspense } from "react";
import { Header } from "@/components/marketing/Header";
import { Hero } from "@/components/marketing/Hero";
import { StoryBlock } from "@/components/marketing/StoryBlock";
import { LocationBlock } from "@/components/marketing/LocationBlock";
import { MenuBlock } from "@/components/marketing/MenuBlock";
import { DualCTABlock } from "@/components/marketing/DualCTABlock";
import { Footer } from "@/components/marketing/Footer";
import { getSettings } from "@/lib/db/queries/settings";
import { listProductsByCatalog } from "@/lib/db/queries/products";
import { getOpeningHours, listActiveServices } from "@/lib/db/queries/services";

export const metadata = {
  title: "La Dégust' du Grand Coin — Huîtres du Producteur",
  description:
    "Dégustation d'huîtres en direct du producteur au cœur du marais poitevin vendéen. Réservez votre table ou commandez en Click & Collect.",
  keywords: [
    "huîtres",
    "dégustation",
    "marais poitevin",
    "vendée",
    "fruits de mer",
    "producteur",
    "huîtres vendée",
    "click collect huîtres",
  ],
  openGraph: {
    title: "La Dégust' du Grand Coin — Huîtres du Producteur",
    description:
      "Huîtres élevées dans nos parcs, servies le matin même au bord du marais poitevin vendéen.",
    type: "website",
    locale: "fr_FR",
    siteName: "La Dégust' du Grand Coin",
  },
  twitter: {
    card: "summary_large_image" as const,
    title: "La Dégust' du Grand Coin",
    description: "Huîtres fraîches du producteur, Vendée.",
  },
};

async function fetchPageData() {
  const [settingsResult, catalogResult, hoursResult, servicesResult] =
    await Promise.allSettled([
      getSettings(),
      listProductsByCatalog(),
      getOpeningHours(),
      listActiveServices(),
    ]);

  return {
    settings:
      settingsResult.status === "fulfilled" ? settingsResult.value : null,
    catalog:
      catalogResult.status === "fulfilled" ? catalogResult.value : [],
    openingHours:
      hoursResult.status === "fulfilled" ? hoursResult.value : [],
    services:
      servicesResult.status === "fulfilled" ? servicesResult.value : [],
  };
}

export default async function LandingPage() {
  const { settings, catalog, openingHours, services } = await fetchPageData();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    name: settings?.name ?? "La Dégust' du Grand Coin",
    description:
      "Dégustation d'huîtres en direct du producteur, au cœur du marais poitevin vendéen.",
    telephone: settings?.phone ?? undefined,
    email: settings?.email ?? undefined,
    address: settings?.address
      ? {
          "@type": "PostalAddress",
          streetAddress: settings.address,
          addressCountry: "FR",
        }
      : undefined,
    ...(settings?.latitude && settings?.longitude
      ? {
          geo: {
            "@type": "GeoCoordinates",
            latitude: settings.latitude,
            longitude: settings.longitude,
          },
        }
      : {}),
    servesCuisine: ["Fruits de mer", "Huîtres", "Crustacés"],
    priceRange: "€€",
    currenciesAccepted: "EUR",
    paymentAccepted: "Cash, Carte bancaire",
  };

  return (
    <>
      {/* Skip link accessibilité */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:px-4 focus:py-2 focus:bg-beurre focus:text-encre focus:font-semibold focus:rounded-lg focus:shadow-lg"
      >
        Aller au contenu principal
      </a>

      <Header />

      <main id="main-content">
        <Hero />
        <StoryBlock />
        <Suspense>
          <LocationBlock
            settings={settings}
            openingHours={openingHours}
            services={services}
          />
        </Suspense>
        <MenuBlock catalog={catalog} />
        <DualCTABlock />
      </main>

      <Footer settings={settings} />

      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
    </>
  );
}
