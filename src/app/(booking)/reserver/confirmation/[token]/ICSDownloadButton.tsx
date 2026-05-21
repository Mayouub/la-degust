"use client";

import { CalendarIcon } from "lucide-react";

type Props = {
  reservation: {
    date: string;
    time: string;
    partySize: number;
    customerName: string;
    token: string;
    serviceName: string;
    tableDuration: number;
  };
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function toICSDateTime(dateStr: string, timeStr: string): string {
  // dateStr: YYYY-MM-DD, timeStr: HH:MM
  const [y, mo, d] = dateStr.split("-").map(Number);
  const [h, m] = timeStr.split(":").map(Number);
  return `${y}${pad2(mo)}${pad2(d)}T${pad2(h)}${pad2(m)}00`;
}

function addMinutesToICS(dateStr: string, timeStr: string, minutes: number): string {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const [h, m] = timeStr.split(":").map(Number);
  const totalMin = h * 60 + m + minutes;
  const endH = Math.floor(totalMin / 60) % 24;
  const endM = totalMin % 60;
  return `${y}${pad2(mo)}${pad2(d)}T${pad2(endH)}${pad2(endM)}00`;
}

export function ICSDownloadButton({ reservation }: Props) {
  function download() {
    const uid = reservation.token + "@ladegustdugrandcoin.fr";
    const dtStart = toICSDateTime(reservation.date, reservation.time);
    const dtEnd = addMinutesToICS(
      reservation.date,
      reservation.time,
      reservation.tableDuration
    );
    const now = new Date()
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
    const confirmNo = reservation.token
      .replace(/-/g, "")
      .slice(0, 8)
      .toUpperCase();

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//La Dégust' du Grand Coin//Réservation//FR",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${uid}`,
      `DTSTAMP:${now}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:Réservation La Dégust' du Grand Coin`,
      `DESCRIPTION:${reservation.partySize} personne(s) — ${reservation.serviceName}\\nN° ${confirmNo}`,
      `LOCATION:La Dégust' du Grand Coin - 85 Rue du Grand Coin - 85550 La Barre-de-Monts`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reservation-degust-${confirmNo}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={download}
      className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-full bg-marine text-beurre text-sm font-semibold hover:bg-encre transition-colors"
    >
      <CalendarIcon className="size-4" />
      Ajouter à mon agenda
    </button>
  );
}
