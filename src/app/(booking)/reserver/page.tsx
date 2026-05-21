import type { Metadata } from "next";
import Link from "next/link";
import { ChevronLeftIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { BookingTunnel } from "@/components/booking/BookingTunnel";

export const metadata: Metadata = {
  title: "Réserver une table",
  description:
    "Réservez votre table à La Dégust' du Grand Coin — huîtres en direct du producteur. Disponibilités en temps réel.",
};

export default async function ReserverPage() {
  const supabase = await createClient();

  // Pré-charge les données statiques pour le calendrier
  const [{ data: openingHours }, { data: closures }] = await Promise.all([
    supabase.from("opening_hours").select("*").order("day_of_week"),
    supabase
      .from("exceptional_closures")
      .select("*")
      .gte("date_end", new Date().toISOString().slice(0, 10))
      .order("date_start"),
  ]);

  return (
    <div className="min-h-screen bg-sable">
      {/* Header simplifié */}
      <header className="bg-marine text-beurre px-4 py-4 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-1 text-beurre/70 hover:text-beurre transition-colors text-sm"
          >
            <ChevronLeftIcon className="size-4" />
            Retour
          </Link>
          <h1 className="font-display text-xl tracking-wide">
            Réserver une table
          </h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        <BookingTunnel
          openingHours={openingHours ?? []}
          exceptionalClosures={closures ?? []}
        />
      </main>
    </div>
  );
}
