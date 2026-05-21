import { describe, it, expect } from "vitest";
import {
  generateServiceSlots,
  isDateDisabled,
  type Service,
  type OpeningHour,
  type ExceptionalClosure,
} from "./availability";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const svc: Service = {
  id: "svc-1",
  name: "Service midi",
  day_of_week: 2,
  start_time: "12:00:00",
  end_time: "14:30:00",
  max_covers: 24,
  slot_duration_minutes: 15,
  table_duration_minutes: 90,
  is_active: true,
};

// ── generateServiceSlots ──────────────────────────────────────────────────────

describe("generateServiceSlots", () => {
  it("génère le bon nombre de créneaux", () => {
    // start=720, end=870, duration=90, lastSlot=780 (13:00), step=15
    // → créneaux : 12:00 12:15 12:30 12:45 13:00 = 5
    const slots = generateServiceSlots(svc, [], 4);
    expect(slots).toHaveLength(5);
    expect(slots[0].time).toBe("12:00");
    expect(slots[4].time).toBe("13:00");
  });

  it("le dernier créneau possible est inclus, le suivant exclu", () => {
    const slots = generateServiceSlots(svc, [], 4);
    expect(slots.find((s) => s.time === "13:00")).toBeDefined();
    expect(slots.find((s) => s.time === "13:15")).toBeUndefined();
  });

  it("créneau indisponible si couverts restants < party_size", () => {
    const existing = [{ reservation_time: "12:00:00", party_size: 22 }];
    const slots = generateServiceSlots(svc, existing, 4);
    // 12:00 : booked=22, available=2 < 4 → indisponible
    expect(slots[0].booked).toBe(22);
    expect(slots[0].available).toBe(2);
    expect(slots[0].isAvailable).toBe(false);
  });

  it("chevauchement : une resa à 12:15 n'impacte pas 12:00", () => {
    // resa à 12:15 (735 min) occupe [735, 825)
    // créneau 12:00 (720) : 720 >= 735 ? non → pas d'overlap
    // créneau 12:15 (735) : 735 >= 735 && 735 < 825 → overlap
    // créneau 12:30 (750) : 750 >= 735 && 750 < 825 → overlap
    const existing = [{ reservation_time: "12:15:00", party_size: 10 }];
    const slots = generateServiceSlots(svc, existing, 4);
    expect(slots[0].booked).toBe(0);  // 12:00
    expect(slots[1].booked).toBe(10); // 12:15
    expect(slots[2].booked).toBe(10); // 12:30
    expect(slots[3].booked).toBe(10); // 12:45 : 765 < 825 → overlap
    expect(slots[4].booked).toBe(10); // 13:00 : 780 < 825 → overlap (resa libérée à 13:45)
  });

  it("party_size supérieur à max_covers → tous indisponibles", () => {
    const slots = generateServiceSlots(svc, [], 30);
    expect(slots.every((s) => !s.isAvailable)).toBe(true);
  });

  it("filtre les créneaux passés quand nowMinutes est fourni", () => {
    // now=12:10 (730 min), leadTime=30 → skip créneaux ≤ 760 (12:40)
    const slots = generateServiceSlots(svc, [], 4, 730, 30);
    expect(slots[0].time).toBe("12:45");
  });

  it("deux réservations cumulées peuvent rendre un créneau complet", () => {
    const existing = [
      { reservation_time: "12:00:00", party_size: 14 },
      { reservation_time: "12:30:00", party_size: 12 },
    ];
    // 12:00 (720) : chevauchement [720,810) → resa1 (720<810 ✓), resa2 (750<810 ✓)
    // booked = 14+12 = 26 > 24 → mais available = max(0, 24-26) = 0
    const slots = generateServiceSlots(svc, existing, 4);
    const slot1230 = slots.find((s) => s.time === "12:30")!;
    expect(slot1230.booked).toBeGreaterThan(svc.max_covers);
    expect(slot1230.available).toBe(0);
    expect(slot1230.isAvailable).toBe(false);
  });

  it("service sans créneaux valides retourne tableau vide", () => {
    const shortSvc: Service = {
      ...svc,
      start_time: "12:00:00",
      end_time: "12:30:00", // end - duration = -60 → lastSlot < start → aucun créneau
    };
    const slots = generateServiceSlots(shortSvc, [], 4);
    expect(slots).toHaveLength(0);
  });
});

// ── isDateDisabled ────────────────────────────────────────────────────────────

describe("isDateDisabled", () => {
  const openingHours: OpeningHour[] = [
    { id: 1, day_of_week: 1, is_closed: true }, // Lundi fermé
  ];
  const closures: ExceptionalClosure[] = [
    {
      id: "c1",
      date_start: "2026-08-01",
      date_end: "2026-08-15",
      reason: "Vacances",
    },
  ];
  const now = new Date("2026-05-21T10:00:00");

  it("désactive les dates passées", () => {
    expect(
      isDateDisabled(new Date("2026-05-20"), openingHours, closures, now)
    ).toBe(true);
  });

  it("n'active pas aujourd'hui avant la coupure", () => {
    expect(
      isDateDisabled(new Date("2026-05-21"), openingHours, closures, now)
    ).toBe(false);
  });

  it("désactive aujourd'hui après la coupure (20h)", () => {
    const lateNow = new Date("2026-05-21T21:00:00");
    expect(
      isDateDisabled(new Date("2026-05-21"), openingHours, closures, lateNow)
    ).toBe(true);
  });

  it("désactive les lundis (jour de fermeture)", () => {
    // 2026-05-25 = lundi
    expect(
      isDateDisabled(new Date("2026-05-25"), openingHours, closures, now)
    ).toBe(true);
  });

  it("désactive une date dans une fermeture exceptionnelle", () => {
    expect(
      isDateDisabled(new Date("2026-08-10"), openingHours, closures, now)
    ).toBe(true);
  });

  it("active une date future normale (mardi)", () => {
    // 2026-06-16 = mardi
    expect(
      isDateDisabled(new Date("2026-06-16"), openingHours, closures, now)
    ).toBe(false);
  });

  it("active le premier jour après la fermeture exceptionnelle", () => {
    // 2026-08-16 = lendemain de la fermeture
    expect(
      isDateDisabled(new Date("2026-08-16"), openingHours, closures, now)
    ).toBe(false);
  });
});
