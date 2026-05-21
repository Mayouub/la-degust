"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2Icon } from "lucide-react";
import { cancelReservationAction } from "@/lib/actions/reservations";

type Props = { token: string };

export function CancelButton({ token }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleConfirm() {
    setLoading(true);
    const result = await cancelReservationAction(token);
    setLoading(false);
    setConfirming(false);

    if (result.success) {
      toast.success("Réservation annulée.");
      router.refresh();
    } else if (result.error === "too_late") {
      toast.error(
        "Annulation impossible à moins de 24h — appelez-nous directement."
      );
    } else if (result.error === "already_cancelled") {
      toast.info("Cette réservation est déjà annulée.");
      router.refresh();
    } else {
      toast.error("Erreur lors de l'annulation. Veuillez réessayer.");
    }
  }

  if (confirming) {
    return (
      <div className="inline-flex items-center gap-2">
        <span className="text-sm text-marine/70">Confirmer l&apos;annulation ?</span>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={loading}
          className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-red-600 text-white text-sm font-semibold hover:bg-red-700 disabled:opacity-60 transition-colors"
        >
          {loading ? (
            <Loader2Icon className="size-4 animate-spin" />
          ) : (
            "Oui, annuler"
          )}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="px-4 py-2 rounded-full border border-kraft/40 text-sm text-marine/70 hover:text-marine transition-colors"
        >
          Non
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full border border-red-200 text-sm text-red-600 hover:border-red-400 hover:bg-red-50 transition-colors"
    >
      Annuler la réservation
    </button>
  );
}
