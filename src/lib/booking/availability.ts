import type { Tables } from "@/types/database.types";

export type Service = Tables<"services">;
export type OpeningHour = Tables<"opening_hours">;
export type ExceptionalClosure = Tables<"exceptional_closures">;

export type SlotInfo = {
  time: string;
  booked: number;
  available: number;
  isAvailable: boolean;
};

export type ServiceWithSlots = {
  service: Service;
  slots: SlotInfo[];
};

export type ExistingReservation = {
  reservation_time: string;
  party_size: number;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

export function timeToMinutes(time: string): number {
  const parts = time.split(":").map(Number);
  return parts[0] * 60 + parts[1];
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

export function toDateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// ── Logique de créneaux (fonction pure, testable) ─────────────────────────────

/**
 * Génère les créneaux horaires d'un service pour une date donnée.
 * Fonction pure — aucun effet de bord, aucun appel DB.
 *
 * @param service          Configuration du service
 * @param existing         Réservations existantes (même service, même date)
 * @param partySize        Nombre de couverts demandés
 * @param nowMinutes       Heure actuelle en minutes (même jour → filtre passé). -1 = désactivé
 * @param leadTimeMinutes  Délai minimum avant un créneau (même jour)
 */
export function generateServiceSlots(
  service: Service,
  existing: ExistingReservation[],
  partySize: number,
  nowMinutes = -1,
  leadTimeMinutes = 30
): SlotInfo[] {
  const startMin = timeToMinutes(service.start_time);
  const endMin = timeToMinutes(service.end_time);
  const step = service.slot_duration_minutes;
  const duration = service.table_duration_minutes;
  // Dernier créneau : la table doit être libérée avant la fin du service
  const lastSlotStart = endMin - duration;

  const slots: SlotInfo[] = [];

  for (let t = startMin; t <= lastSlotStart; t += step) {
    // Filtre les créneaux trop proches (même jour)
    if (nowMinutes >= 0 && t <= nowMinutes + leadTimeMinutes) continue;

    const slotTime = minutesToTime(t);

    // Couverts occupés = réservations dont la table chevauche [t, t+duration)
    const booked = existing.reduce((sum, r) => {
      const rStart = timeToMinutes(r.reservation_time);
      const rEnd = rStart + duration;
      return t >= rStart && t < rEnd ? sum + r.party_size : sum;
    }, 0);

    const available = Math.max(0, service.max_covers - booked);
    slots.push({
      time: slotTime,
      booked,
      available,
      isAvailable: available >= partySize,
    });
  }

  return slots;
}

// ── Logique de désactivation du calendrier (fonction pure) ────────────────────

/**
 * Retourne true si la date doit être grisée dans le calendrier.
 *
 * Règles :
 * - Dates passées
 * - Aujourd'hui si après l'heure de coupure
 * - Jours de fermeture hebdomadaire (opening_hours.is_closed)
 * - Jours dans une fermeture exceptionnelle
 */
export function isDateDisabled(
  date: Date,
  openingHours: OpeningHour[],
  exceptionalClosures: ExceptionalClosure[],
  now: Date,
  cutoffHour = 20
): boolean {
  const todayMidnight = new Date(now);
  todayMidnight.setHours(0, 0, 0, 0);

  const dateMidnight = new Date(date);
  dateMidnight.setHours(0, 0, 0, 0);

  if (dateMidnight < todayMidnight) return true;

  if (
    dateMidnight.getTime() === todayMidnight.getTime() &&
    now.getHours() >= cutoffHour
  ) {
    return true;
  }

  // Convention day_of_week : 0=Dimanche, 1=Lundi, ... 6=Samedi (= JS getDay())
  const dayOfWeek = date.getDay();
  const hourConfig = openingHours.find((h) => h.day_of_week === dayOfWeek);
  if (hourConfig?.is_closed) return true;

  const dateStr = toDateString(date);
  if (
    exceptionalClosures.some(
      (c) => c.date_start <= dateStr && dateStr <= c.date_end
    )
  ) {
    return true;
  }

  // Jour sans service configuré — on ne le bloque pas ici,
  // l'utilisateur découvrira l'absence de créneaux à l'étape 2.
  return false;
}
