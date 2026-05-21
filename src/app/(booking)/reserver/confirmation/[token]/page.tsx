import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CheckCircle2Icon, XCircleIcon } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/server";
import { CancelButton } from "./CancelButton";
import { ICSDownloadButton } from "./ICSDownloadButton";

export const metadata: Metadata = {
  title: "Réservation confirmée",
  robots: { index: false },
};

type Props = {
  params: Promise<{ token: string }>;
};

export default async function ConfirmationPage({ params }: Props) {
  const { token } = await params;

  const supabase = createAdminClient();
  const { data: reservation, error } = await supabase
    .from("reservations")
    .select("*, services(name, start_time, end_time, table_duration_minutes)")
    .eq("public_token", token)
    .single();

  if (error || !reservation) {
    notFound();
  }

  const isCancelled = reservation.status === "cancelled";
  const confirmationNumber = token.replace(/-/g, "").slice(0, 8).toUpperCase();

  const dateObj = new Date(reservation.reservation_date + "T12:00:00");
  const formattedDate = format(dateObj, "EEEE d MMMM yyyy", { locale: fr });
  const capitalDate =
    formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return (
    <div className="min-h-screen bg-sable flex flex-col">
      {/* Header */}
      <header className="bg-marine text-beurre px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <Link
            href="/"
            className="text-beurre/60 hover:text-beurre text-sm transition-colors"
          >
            ← La Dégust&apos; du Grand Coin
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto w-full px-4 py-10 sm:py-16 flex-1">
        {/* Statut annulé */}
        {isCancelled ? (
          <div className="text-center space-y-4 mb-10">
            <XCircleIcon className="size-16 text-red-400 mx-auto" />
            <h1 className="text-2xl font-display text-marine tracking-wide">
              Réservation annulée
            </h1>
            <p className="text-marine/60">
              Cette réservation a été annulée.
            </p>
            <Link
              href="/reserver"
              className="inline-block mt-4 px-6 py-3 rounded-full bg-marine text-beurre text-sm font-semibold hover:bg-encre transition-colors"
            >
              Faire une nouvelle réservation
            </Link>
          </div>
        ) : (
          <>
            {/* Confirmation */}
            <div className="text-center space-y-2 mb-8">
              <CheckCircle2Icon className="size-16 text-algue mx-auto" />
              <h1 className="text-2xl sm:text-3xl font-display text-marine tracking-wide">
                Réservation confirmée !
              </h1>
              <p className="text-marine/60">
                Un e-mail de confirmation vous a été envoyé.
              </p>
            </div>

            {/* Fiche récap */}
            <div className="bg-white rounded-2xl border border-kraft/30 overflow-hidden mb-6">
              {/* Header fiche */}
              <div className="bg-marine/5 px-6 py-4 flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-widest text-marine/50">
                  Récapitulatif
                </span>
                <span className="text-xs font-mono bg-marine text-beurre px-2.5 py-1 rounded-full">
                  N° {confirmationNumber}
                </span>
              </div>

              {/* Détails */}
              <div className="px-6 py-5 space-y-3">
                <Row label="Nom" value={reservation.customer_name} />
                <Row label="Date" value={capitalDate} />
                <Row
                  label="Heure"
                  value={reservation.reservation_time.slice(0, 5)}
                />
                <Row
                  label="Service"
                  value={
                    (reservation.services as { name: string } | null)?.name ??
                    "—"
                  }
                />
                <Row
                  label="Couverts"
                  value={`${reservation.party_size} personne${reservation.party_size > 1 ? "s" : ""}`}
                />
                {reservation.notes && (
                  <Row label="Commentaire" value={reservation.notes} />
                )}
              </div>
            </div>

            {/* Info rappel */}
            <p className="text-sm text-marine/50 text-center mb-8">
              Vous recevrez un rappel la veille. En cas d&apos;empêchement,
              merci de nous prévenir au moins 24h à l&apos;avance.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <ICSDownloadButton
                reservation={{
                  date: reservation.reservation_date,
                  time: reservation.reservation_time.slice(0, 5),
                  partySize: reservation.party_size,
                  customerName: reservation.customer_name,
                  token,
                  serviceName:
                    (reservation.services as { name: string } | null)?.name ??
                    "",
                  tableDuration:
                    (reservation.services as { table_duration_minutes: number } | null)
                      ?.table_duration_minutes ?? 90,
                }}
              />

              <CancelButton token={token} />

              <Link
                href="/reserver"
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-kraft/50 text-sm text-marine/70 hover:text-marine hover:border-marine transition-colors"
              >
                Modifier / Nouvelle réservation
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline gap-4">
      <span className="text-sm text-marine/50 shrink-0">{label}</span>
      <span className="text-sm font-semibold text-marine text-right">{value}</span>
    </div>
  );
}
