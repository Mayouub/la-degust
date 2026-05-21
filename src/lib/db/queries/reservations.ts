import { createClient, createAdminClient } from "@/lib/supabase/server";
import type {
  Tables,
  TablesInsert,
  Enums,
} from "@/types/database.types";

// ── Helpers horaires ──────────────────────────────────────────────────────────

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type Reservation = Tables<"reservations">;

export type TimeSlot = {
  time: string;
  booked: number;
  available: number;
};

export type ReservationFilters = {
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: Enums<"reservation_status">;
  serviceId?: string;
};

// ── Calcul des créneaux disponibles ──────────────────────────────────────────

/**
 * Retourne les créneaux horaires disponibles pour un service à une date donnée.
 * Tient compte des réservations existantes et de la durée d'occupation table.
 */
export async function getAvailableSlots(
  serviceId: string,
  date: string
): Promise<TimeSlot[]> {
  const supabase = await createClient();

  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("*")
    .eq("id", serviceId)
    .single();

  if (serviceError) throw new Error(serviceError.message);

  // Réservations actives sur ce service + date (exclut annulées et no-shows)
  const { data: existing, error: resaError } = await supabase
    .from("reservations")
    .select("reservation_time, party_size")
    .eq("service_id", serviceId)
    .eq("reservation_date", date)
    .in("status", ["pending", "confirmed", "honored"]);

  if (resaError) throw new Error(resaError.message);

  const startMin = timeToMinutes(service.start_time);
  const endMin   = timeToMinutes(service.end_time);
  const step     = service.slot_duration_minutes;
  const duration = service.table_duration_minutes;

  // Dernier créneau possible : la table doit être libérée avant la fin du service
  const lastSlotStart = endMin - duration;
  const slots: TimeSlot[] = [];

  for (let t = startMin; t <= lastSlotStart; t += step) {
    const slotTime = minutesToTime(t);

    // Couverts occupés = toutes les résa dont la table chevauche ce créneau
    const booked = (existing ?? []).reduce((sum, r) => {
      const rStart = timeToMinutes(r.reservation_time);
      const rEnd   = rStart + duration;
      return t >= rStart && t < rEnd ? sum + r.party_size : sum;
    }, 0);

    slots.push({
      time: slotTime,
      booked,
      available: Math.max(0, service.max_covers - booked),
    });
  }

  return slots;
}

// ── Création ──────────────────────────────────────────────────────────────────

export async function createReservation(
  payload: TablesInsert<"reservations">
) {
  // INSERT public — utilise le client anon (RLS autorise l'insertion publique)
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("reservations")
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ── Lecture admin ─────────────────────────────────────────────────────────────

export async function listReservations(filters: ReservationFilters = {}) {
  const supabase = createAdminClient();
  let query = supabase
    .from("reservations")
    .select("*, services(name, day_of_week, start_time, end_time)")
    .order("reservation_date", { ascending: false })
    .order("reservation_time");

  if (filters.date)     query = query.eq("reservation_date", filters.date);
  if (filters.dateFrom) query = query.gte("reservation_date", filters.dateFrom);
  if (filters.dateTo)   query = query.lte("reservation_date", filters.dateTo);
  if (filters.status)   query = query.eq("status", filters.status);
  if (filters.serviceId) query = query.eq("service_id", filters.serviceId);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function getReservationById(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("reservations")
    .select("*, services(*)")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ── Lecture publique par token ────────────────────────────────────────────────

export async function getReservationByToken(token: string) {
  // Utilise le service role pour contourner la RLS côté serveur
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("reservations")
    .select("*, services(name, day_of_week, start_time, end_time)")
    .eq("public_token", token)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ── Mise à jour admin ────────────────────────────────────────────────────────

export async function updateReservationStatus(
  id: string,
  status: Enums<"reservation_status">
) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("reservations")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateReservation(
  id: string,
  updates: Partial<TablesInsert<"reservations">>
) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("reservations")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ── Stats ─────────────────────────────────────────────────────────────────────

export async function getReservationCountByDate(date: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("reservations")
    .select("party_size, status")
    .eq("reservation_date", date)
    .in("status", ["pending", "confirmed"]);

  if (error) throw new Error(error.message);
  return {
    count: data.length,
    covers: data.reduce((sum, r) => sum + r.party_size, 0),
  };
}
