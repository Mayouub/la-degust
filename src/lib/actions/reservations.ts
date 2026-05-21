"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";
import { Resend } from "resend";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import ReservationConfirmation from "@/emails/ReservationConfirmation";

const resend = new Resend(process.env.RESEND_API_KEY);

// ── Types ─────────────────────────────────────────────────────────────────────

export type CreateReservationInput = {
  serviceId: string;
  serviceName: string;
  date: string;       // YYYY-MM-DD
  time: string;       // HH:MM
  partySize: number;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes?: string;
};

type CreateReservationResult =
  | { success: true; token: string }
  | { success: false; error: "slot_full" | "invalid_input" | "unknown" };

// ── Action principale ────────────────────────────────────────────────────────

export async function createReservationAction(
  input: CreateReservationInput
): Promise<CreateReservationResult> {
  const supabase = await createClient();

  const { data: rpcResult, error } = await supabase.rpc(
    "check_and_create_reservation",
    {
      p_service_id: input.serviceId,
      p_date: input.date,
      p_time: input.time + ":00",
      p_party_size: input.partySize,
      p_customer_name: input.customerName,
      p_customer_phone: input.customerPhone,
      p_customer_email: input.customerEmail || null,
      p_notes: input.notes || null,
    }
  );

  if (error) {
    console.error("[createReservation] RPC error:", error);
    return { success: false, error: "unknown" };
  }

  type RpcResponse = {
    success: boolean;
    error?: string;
    data?: {
      id: string;
      public_token: string;
      party_size: number;
      reservation_date: string;
      reservation_time: string;
    };
  };
  const result = rpcResult as unknown as RpcResponse;

  if (!result.success) {
    return {
      success: false,
      error: result.error === "slot_full" ? "slot_full" : "unknown",
    };
  }

  const token = result.data!.public_token;

  // Envoi email de confirmation en asynchrone — n'attend pas le résultat
  if (input.customerEmail) {
    sendConfirmationEmail({
      customerName: input.customerName,
      customerEmail: input.customerEmail,
      partySize: input.partySize,
      reservationDate: input.date,
      reservationTime: input.time,
      serviceName: input.serviceName,
      token,
    }).catch((err) => console.error("[sendConfirmationEmail]", err));
  }

  return { success: true, token };
}

// ── Annulation publique (par token) ──────────────────────────────────────────

export type CancelReservationResult =
  | { success: true }
  | { success: false; error: "not_found" | "already_cancelled" | "too_late" | "unknown" };

export async function cancelReservationAction(
  token: string
): Promise<CancelReservationResult> {
  const supabase = createAdminClient();

  const { data: reservation, error: fetchError } = await supabase
    .from("reservations")
    .select("id, status, reservation_date, reservation_time")
    .eq("public_token", token)
    .single();

  if (fetchError || !reservation) {
    return { success: false, error: "not_found" };
  }

  if (reservation.status === "cancelled") {
    return { success: false, error: "already_cancelled" };
  }

  // Interdit d'annuler à moins de 24h
  const resaDateTime = new Date(
    `${reservation.reservation_date}T${reservation.reservation_time}`
  );
  const hoursUntil =
    (resaDateTime.getTime() - Date.now()) / (1000 * 60 * 60);
  if (hoursUntil < 24) {
    return { success: false, error: "too_late" };
  }

  const { error: updateError } = await supabase
    .from("reservations")
    .update({ status: "cancelled" })
    .eq("id", reservation.id);

  if (updateError) {
    console.error("[cancelReservation]", updateError);
    return { success: false, error: "unknown" };
  }

  return { success: true };
}

// ── Email ─────────────────────────────────────────────────────────────────────

async function sendConfirmationEmail(params: {
  customerName: string;
  customerEmail: string;
  partySize: number;
  reservationDate: string;
  reservationTime: string;
  serviceName: string;
  token: string;
}) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ladegustdugrandcoin.fr";

  const dateObj = new Date(params.reservationDate + "T12:00:00");
  const formattedDate = format(dateObj, "EEEE d MMMM yyyy", { locale: fr });
  const capitalizedDate =
    formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  const confirmationNumber = params.token.replace(/-/g, "").slice(0, 8).toUpperCase();

  await resend.emails.send({
    from:
      process.env.RESEND_FROM_EMAIL ??
      "La Dégust' du Grand Coin <contact@ladegustdugrandcoin.fr>",
    to: [params.customerEmail],
    subject: `Réservation confirmée · ${capitalizedDate} à ${params.reservationTime}`,
    react: ReservationConfirmation({
      customerName: params.customerName,
      partySize: params.partySize,
      reservationDate: capitalizedDate,
      reservationTime: params.reservationTime,
      serviceName: params.serviceName,
      confirmationNumber,
      cancelUrl: `${siteUrl}/reserver/confirmation/${params.token}`,
    }),
  });
}
