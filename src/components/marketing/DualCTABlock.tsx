import Link from "next/link";
import { CalendarDays, ShoppingBag } from "lucide-react";
import { ScrollFadeIn } from "./ScrollFadeIn";

export function DualCTABlock() {
  return (
    <section
      className="bg-marine py-20 md:py-24"
      aria-labelledby="cta-title"
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <ScrollFadeIn>
          <h2
            id="cta-title"
            className="font-display text-beurre text-3xl sm:text-4xl uppercase text-center mb-12 sr-only"
          >
            Commander ou réserver
          </h2>
        </ScrollFadeIn>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {/* Réserver */}
          <ScrollFadeIn delay={0}>
            <div className="group bg-white/5 hover:bg-white/10 border border-white/15 hover:border-beurre/40 rounded-2xl p-8 sm:p-10 flex flex-col transition-all duration-300">
              <CalendarDays
                className="text-beurre mb-5"
                size={36}
                aria-hidden
              />
              <h3 className="font-display text-white text-2xl sm:text-3xl uppercase mb-3">
                Réserver une table
              </h3>
              <p className="text-sable/70 leading-relaxed flex-1 mb-8">
                Profitez de notre terrasse face au marais ou de la salle
                intérieure. Réservation en ligne simple et rapide, confirmation
                immédiate.
              </p>
              <Link
                href="/reserver"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-beurre text-encre font-semibold rounded-xl text-base hover:bg-beurre/90 hover:scale-105 transition-all duration-200 w-full sm:w-auto"
              >
                Réserver maintenant →
              </Link>
            </div>
          </ScrollFadeIn>

          {/* Click & Collect */}
          <ScrollFadeIn delay={120}>
            <div className="group bg-white/5 hover:bg-white/10 border border-white/15 hover:border-beurre/40 rounded-2xl p-8 sm:p-10 flex flex-col transition-all duration-300">
              <ShoppingBag
                className="text-beurre mb-5"
                size={36}
                aria-hidden
              />
              <h3 className="font-display text-white text-2xl sm:text-3xl uppercase mb-3">
                Click &amp; Collect
              </h3>
              <p className="text-sable/70 leading-relaxed flex-1 mb-8">
                Commandez vos huîtres et produits de la mer en ligne. Retirez
                votre commande directement au bord de l&apos;eau à l&apos;heure choisie.
              </p>
              <Link
                href="/commander"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-beurre/60 text-beurre font-semibold rounded-xl text-base hover:bg-beurre hover:text-encre transition-all duration-200 w-full sm:w-auto"
              >
                Commander en ligne →
              </Link>
            </div>
          </ScrollFadeIn>
        </div>
      </div>
    </section>
  );
}
