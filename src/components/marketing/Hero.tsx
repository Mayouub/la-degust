import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { OpenStatusBadge } from "@/components/ui/open-status-badge";
import { ChevronDown } from "lucide-react";

export function Hero() {
  return (
    <section
      className="relative min-h-screen overflow-hidden bg-marine"
      aria-label="Bienvenue à La Dégust' du Grand Coin"
    >
      {/* Background photo */}
      <Image
        src="https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=1920&auto=format&fit=crop&q=80"
        alt="Parc à huîtres au coucher du soleil, marais poitevin vendéen"
        fill
        className="object-cover object-center"
        priority
        sizes="100vw"
      />

      {/* Marine overlay */}
      <div className="absolute inset-0 bg-marine/65" />

      {/* Grain noise overlay */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundRepeat: "repeat",
          backgroundSize: "256px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 h-full min-h-screen flex flex-col justify-center pt-24 pb-32">
        {/* Handwritten accroche */}
        <p className="font-hand text-beurre text-xl sm:text-2xl md:text-3xl mb-4 md:mb-6 leading-tight">
          ouvertes le matin même —
        </p>

        {/* Display title */}
        <h1 className="font-display text-white text-[clamp(3rem,10vw,7rem)] uppercase leading-[0.92] tracking-tight max-w-3xl">
          L&apos;HUÎTRE,
          <br />
          DU PARC
          <br />À VOTRE TABLE.
        </h1>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-8 md:mt-10">
          <Link
            href="/reserver"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-beurre text-encre font-semibold rounded-xl text-base hover:bg-beurre/90 hover:scale-105 transition-all duration-200 w-full sm:w-auto"
          >
            Réserver une table →
          </Link>
          <Link
            href="/commander"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-white/60 text-white font-semibold rounded-xl text-base hover:bg-white/10 hover:border-white transition-all duration-200 w-full sm:w-auto"
          >
            Commander en Click &amp; Collect
          </Link>
        </div>
      </div>

      {/* Floating info card */}
      <div className="absolute bottom-8 right-4 sm:right-8 z-20 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 min-w-[200px] max-w-[240px]">
        <Suspense
          fallback={
            <span className="inline-flex items-center gap-2 text-sable/60 text-sm">
              <span className="h-2 w-2 rounded-full bg-kraft/50 animate-pulse" />
              Chargement…
            </span>
          }
        >
          <OpenStatusBadge className="bg-transparent ring-0 text-sable px-0" />
        </Suspense>
        <p className="text-sable/70 text-xs mt-2 font-medium">
          Service sur place · Réservation conseillée
        </p>
        <Link
          href="/reserver"
          className="mt-3 block text-center text-xs font-semibold text-beurre hover:text-beurre/80 transition-colors"
        >
          Voir les disponibilités →
        </Link>
      </div>

      {/* Scroll indicator */}
      <div className="absolute right-5 sm:right-6 bottom-10 z-20 hidden sm:flex flex-col items-center gap-3">
        <span
          className="text-white/40 text-[10px] font-medium tracking-[0.25em] uppercase"
          style={{ writingMode: "vertical-rl" }}
        >
          Scroll
        </span>
        <ChevronDown className="text-white/30 animate-bounce" size={16} />
      </div>
    </section>
  );
}
