import { notFound } from "next/navigation";
import { Logo } from "@/components/ui/logo";
import { SectionDivider } from "@/components/ui/section-divider";
import { OpenStatusBadge } from "@/components/ui/open-status-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DesignSystemPage() {
  if (process.env.NODE_ENV !== "development") notFound();

  const palette = [
    { name: "marine", hex: "#1B3A5B", tw: "bg-marine", dark: true },
    { name: "encre", hex: "#0F1A2B", tw: "bg-encre", dark: true },
    { name: "beurre", hex: "#FAF4A6", tw: "bg-beurre", dark: false },
    { name: "sable", hex: "#F4EEDD", tw: "bg-sable", dark: false },
    { name: "papier", hex: "#FAF6E8", tw: "bg-papier", dark: false },
    { name: "eau", hex: "#5C8FCF", tw: "bg-eau", dark: true },
    { name: "algue", hex: "#4A6A2A", tw: "bg-algue", dark: true },
    { name: "kraft", hex: "#C9B58F", tw: "bg-kraft", dark: false },
  ];

  return (
    <div className="min-h-screen bg-sable">
      {/* Header */}
      <header className="bg-marine px-8 py-6">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <Logo variant="blanc" size="md" />
          <span className="font-hand text-beurre text-xl">Design System</span>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-16 px-8 py-12">

        {/* ── Palette ─────────────────────────────────────────── */}
        <section>
          <h2 className="font-display text-3xl text-marine mb-6 uppercase tracking-wide">
            Palette
          </h2>
          <div className="grid grid-cols-4 gap-4 sm:grid-cols-8">
            {palette.map(({ name, hex, tw, dark }) => (
              <div key={name} className="flex flex-col gap-2">
                <div
                  className={`${tw} h-20 w-full rounded-lg ring-1 ring-kraft/30`}
                />
                <p className="text-xs font-medium text-encre">{name}</p>
                <p className="text-xs text-encre/50 font-mono">{hex}</p>
              </div>
            ))}
          </div>
        </section>

        <SectionDivider />

        {/* ── Typographies ────────────────────────────────────── */}
        <section>
          <h2 className="font-display text-3xl text-marine mb-8 uppercase tracking-wide">
            Typographies
          </h2>

          <div className="space-y-8">
            <div className="space-y-2">
              <p className="text-xs text-kraft uppercase tracking-widest">
                Anton — font-display — Titres display
              </p>
              <p className="font-display text-6xl text-marine uppercase leading-none">
                La Dégust'
              </p>
              <p className="font-display text-4xl text-marine uppercase">
                Du Grand Coin
              </p>
              <p className="font-display text-2xl text-encre uppercase">
                Huîtres fines de claire
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-kraft uppercase tracking-widest">
                Caveat — font-hand — Accents manuscrits
              </p>
              <p className="font-hand text-5xl text-marine">
                La Dégust' du Grand Coin
              </p>
              <p className="font-hand text-3xl text-eau">
                Venez savourer nos huîtres…
              </p>
              <p className="font-hand text-xl text-encre/70">
                Ouvert du mardi au dimanche
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs text-kraft uppercase tracking-widest">
                Inter — font-sans — Corps de texte
              </p>
              <p className="text-2xl text-encre font-light">
                Dégustation en direct du producteur
              </p>
              <p className="text-base text-encre">
                Huîtres élevées en claire pour un affinage délicat. Goût iodé,
                chair ferme. Idéales pour les amateurs comme pour les
                connaisseurs.
              </p>
              <p className="text-sm text-encre/70">
                Prix indicatif — 12 huîtres n°3 · 12,00 €
              </p>
              <p className="text-xs text-encre/50 font-mono">
                42 Route du Marais, 85580 Saint-Michel-en-l'Herm
              </p>
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* ── Logos ───────────────────────────────────────────── */}
        <section>
          <h2 className="font-display text-3xl text-marine mb-8 uppercase tracking-wide">
            Logos
          </h2>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            <div className="flex flex-col gap-3">
              <div className="flex h-24 items-center justify-center rounded-lg bg-papier ring-1 ring-kraft/30 px-4">
                <Logo variant="encre" size="sm" />
              </div>
              <p className="text-center text-xs text-encre/60">encre</p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex h-24 items-center justify-center rounded-lg bg-marine px-4">
                <Logo variant="blanc" size="sm" />
              </div>
              <p className="text-center text-xs text-encre/60">blanc</p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex h-24 items-center justify-center rounded-lg bg-sable ring-1 ring-kraft/30 px-4">
                <Logo variant="bleu" size="sm" />
              </div>
              <p className="text-center text-xs text-encre/60">bleu</p>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex h-24 items-center justify-center rounded-lg bg-encre px-4">
                <Logo variant="beurre" size="sm" />
              </div>
              <p className="text-center text-xs text-encre/60">beurre</p>
            </div>
          </div>
        </section>

        <SectionDivider />

        {/* ── Composants ──────────────────────────────────────── */}
        <section>
          <h2 className="font-display text-3xl text-marine mb-8 uppercase tracking-wide">
            Composants
          </h2>

          <div className="space-y-10">
            {/* Buttons */}
            <div>
              <p className="text-xs text-kraft uppercase tracking-widest mb-4">
                Boutons
              </p>
              <div className="flex flex-wrap gap-3 items-center">
                <Button>Réserver une table</Button>
                <Button variant="outline">Commander en ligne</Button>
                <Button variant="secondary">En savoir plus</Button>
                <Button variant="ghost">Voir la carte</Button>
                <Button
                  className="bg-beurre text-encre hover:bg-beurre/80 font-semibold"
                >
                  Commander maintenant
                </Button>
                <Button disabled>Complet</Button>
              </div>
            </div>

            {/* Badges */}
            <div>
              <p className="text-xs text-kraft uppercase tracking-widest mb-4">
                Badges &amp; statuts
              </p>
              <div className="flex flex-wrap gap-3 items-center">
                <Badge>Nouveau</Badge>
                <Badge variant="secondary">Fine de Claire</Badge>
                <Badge variant="outline">Spéciale</Badge>
                <Badge className="bg-algue/10 text-algue ring-1 ring-algue/30">
                  Disponible
                </Badge>
                <Badge className="bg-kraft/20 text-encre/70 ring-1 ring-kraft/40">
                  Épuisé
                </Badge>
              </div>
            </div>

            {/* OpenStatusBadge en live */}
            <div>
              <p className="text-xs text-kraft uppercase tracking-widest mb-4">
                Statut d'ouverture (live)
              </p>
              <OpenStatusBadge />
            </div>

            {/* Cards */}
            <div>
              <p className="text-xs text-kraft uppercase tracking-widest mb-4">
                Cards produit
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Card className="bg-papier border-kraft/30">
                  <CardHeader className="pb-2">
                    <CardTitle className="font-display text-xl text-marine uppercase tracking-wide">
                      Fine de Claire n°3
                    </CardTitle>
                    <p className="font-hand text-eau text-lg">douzaine</p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-encre/70 mb-4">
                      Goût iodé, chair ferme. Affinée en claire.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-display text-2xl text-marine">
                        12,00 €
                      </span>
                      <Button
                        size="sm"
                        className="bg-beurre text-encre hover:bg-beurre/80"
                      >
                        Ajouter
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Hero card */}
                <Card className="bg-marine text-sable border-0 col-span-1 sm:col-span-2">
                  <CardHeader className="pb-2">
                    <Badge className="w-fit bg-beurre/20 text-beurre border-0 mb-2">
                      ★ Coup de cœur
                    </Badge>
                    <CardTitle className="font-display text-2xl text-sable uppercase tracking-wide">
                      Plateau Prestige
                    </CardTitle>
                    <p className="font-hand text-beurre text-xl">
                      24 spéciales + pain artisanal
                    </p>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-sable/70 mb-4">
                      24 huîtres spéciales, pain artisanal, beurre demi-sel et
                      citron.
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-display text-3xl text-beurre">
                        38,00 €
                      </span>
                      <Button className="bg-beurre text-encre hover:bg-beurre/80 font-semibold">
                        Commander
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Section dividers */}
            <div>
              <p className="text-xs text-kraft uppercase tracking-widest mb-4">
                Séparateurs
              </p>
              <div className="space-y-6 bg-papier rounded-lg p-6 ring-1 ring-kraft/20">
                <SectionDivider variant="wave" />
                <SectionDivider variant="dots" />
              </div>
            </div>
          </div>
        </section>

        {/* ── Section marine (dark) ────────────────────────────── */}
        <section className="-mx-8 bg-marine px-8 py-10 rounded-none">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-display text-3xl text-beurre mb-6 uppercase tracking-wide">
              Section sombre (marine)
            </h2>
            <p className="font-hand text-sable text-2xl mb-4">
              Depuis 1987, au cœur du marais poitevin…
            </p>
            <p className="text-sable/70 text-sm mb-6 max-w-lg">
              Nos huîtres sont élevées en claire, affinées avec soin, et
              dégustées dans un cadre authentique face aux marais vendéens.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button className="bg-beurre text-encre hover:bg-beurre/80 font-semibold">
                Réserver une table
              </Button>
              <Button variant="outline" className="border-sable/40 text-sable hover:bg-sable/10">
                Commander en ligne
              </Button>
            </div>
            <SectionDivider variant="wave" inverted className="mt-8" />
          </div>
        </section>

      </main>

      <footer className="bg-encre px-8 py-6 text-center">
        <p className="text-kraft/60 text-xs font-mono">
          Design System · La Dégust' du Grand Coin · dev only
        </p>
      </footer>
    </div>
  );
}
