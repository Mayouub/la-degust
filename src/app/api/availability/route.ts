import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  generateServiceSlots,
  toDateString,
  type ServiceWithSlots,
  type ExistingReservation,
} from "@/lib/booking/availability";

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const dateParam = searchParams.get("date");
  const partySizeParam = searchParams.get("partySize");

  if (!dateParam || !partySizeParam) {
    return NextResponse.json(
      { error: "Paramètres manquants : date et partySize requis" },
      { status: 400 }
    );
  }

  const partySize = parseInt(partySizeParam, 10);
  if (isNaN(partySize) || partySize < 1 || partySize > 12) {
    return NextResponse.json({ error: "partySize invalide" }, { status: 400 });
  }

  // day_of_week JS : 0=Dimanche, 1=Lundi, ... 6=Samedi
  const dateObj = new Date(dateParam + "T12:00:00");
  const dayOfWeek = dateObj.getDay();

  const supabase = await createClient();

  // ── Fermeture exceptionnelle ──────────────────────────────────────────────

  const { data: closures } = await supabase
    .from("exceptional_closures")
    .select("id")
    .lte("date_start", dateParam)
    .gte("date_end", dateParam)
    .limit(1);

  if (closures && closures.length > 0) {
    return NextResponse.json({ services: [] });
  }

  // ── Services actifs ce jour ───────────────────────────────────────────────

  const { data: services, error: svcError } = await supabase
    .from("services")
    .select("*")
    .eq("day_of_week", dayOfWeek)
    .eq("is_active", true)
    .order("start_time");

  if (svcError) {
    console.error("[availability] services error:", svcError);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  if (!services || services.length === 0) {
    return NextResponse.json({ services: [] });
  }

  // ── Réservations existantes pour cette date (tous services confondus) ─────

  const serviceIds = services.map((s) => s.id);
  const { data: existing, error: resaError } = await supabase
    .from("reservations")
    .select("service_id, reservation_time, party_size")
    .eq("reservation_date", dateParam)
    .in("service_id", serviceIds)
    .in("status", ["pending", "confirmed", "honored"]);

  if (resaError) {
    console.error("[availability] reservations error:", resaError);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }

  // Groupe par service_id
  const byService = new Map<string, ExistingReservation[]>();
  for (const r of existing ?? []) {
    const list = byService.get(r.service_id) ?? [];
    list.push({ reservation_time: r.reservation_time, party_size: r.party_size });
    byService.set(r.service_id, list);
  }

  // ── Génère les créneaux ───────────────────────────────────────────────────

  const todayStr = toDateString(new Date());
  const isToday = dateParam === todayStr;
  const nowMinutes = isToday
    ? new Date().getHours() * 60 + new Date().getMinutes()
    : -1;

  const result: ServiceWithSlots[] = services.map((service) => ({
    service,
    slots: generateServiceSlots(
      service,
      byService.get(service.id) ?? [],
      partySize,
      nowMinutes,
      30
    ),
  }));

  // Cache court (30 s) — assez rapide pour le live, évite les doublons
  return NextResponse.json(
    { services: result },
    {
      headers: { "Cache-Control": "private, max-age=30" },
    }
  );
}
