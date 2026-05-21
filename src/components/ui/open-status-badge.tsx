import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";

const TZ = "Europe/Paris";
const DAY_NAMES = ["dim.", "lun.", "mar.", "mer.", "jeu.", "ven.", "sam."];

function toParisTime(date: Date) {
  const str = date.toLocaleString("en-CA", {
    timeZone: TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  // "YYYY-MM-DD, HH:MM"
  const [datePart, timePart] = str.split(", ");
  return { datePart, timePart };
}

function getDayOfWeek(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d).getDay();
}

function addDays(dateStr: string, n: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const dt = new Date(y, m - 1, d + n);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

interface OpenStatus {
  isOpen: boolean;
  serviceName?: string;
  nextLabel?: string;
}

async function getOpenStatus(): Promise<OpenStatus> {
  try {
    const supabase = await createClient();
    const now = new Date();
    const { datePart: todayStr, timePart: currentTime } = toParisTime(now);
    const todayDow = getDayOfWeek(todayStr);

    // Check exceptional closure for today
    const { data: closures } = await supabase
      .from("exceptional_closures")
      .select("reason")
      .lte("date_start", todayStr)
      .gte("date_end", todayStr)
      .limit(1);

    const exceptionalClosure = closures && closures.length > 0;

    // Get opening hours for today
    const { data: ohToday } = await supabase
      .from("opening_hours")
      .select("is_closed")
      .eq("day_of_week", todayDow)
      .single();

    const todayIsClosed = exceptionalClosure || ohToday?.is_closed === true;

    if (!todayIsClosed) {
      // Check if we're inside an active service right now
      const { data: services } = await supabase
        .from("services")
        .select("name, start_time, end_time")
        .eq("day_of_week", todayDow)
        .eq("is_active", true)
        .lte("start_time", currentTime)
        .gte("end_time", currentTime)
        .limit(1);

      if (services && services.length > 0) {
        return { isOpen: true, serviceName: services[0].name };
      }

      // Check for a service starting later today
      const { data: upcoming } = await supabase
        .from("services")
        .select("name, start_time")
        .eq("day_of_week", todayDow)
        .eq("is_active", true)
        .gt("start_time", currentTime)
        .order("start_time")
        .limit(1);

      if (upcoming && upcoming.length > 0) {
        const t = upcoming[0].start_time.slice(0, 5);
        return {
          isOpen: false,
          nextLabel: `Ouvre aujourd'hui à ${t}`,
        };
      }
    }

    // Look ahead up to 7 days for the next opening
    const { data: allHours } = await supabase
      .from("opening_hours")
      .select("day_of_week, is_closed");

    for (let offset = 1; offset <= 7; offset++) {
      const nextDate = addDays(todayStr, offset);
      const nextDow = getDayOfWeek(nextDate);

      const { data: nextClosure } = await supabase
        .from("exceptional_closures")
        .select("id")
        .lte("date_start", nextDate)
        .gte("date_end", nextDate)
        .limit(1);

      if (nextClosure && nextClosure.length > 0) continue;

      const oh = allHours?.find((h) => h.day_of_week === nextDow);
      if (oh?.is_closed) continue;

      const { data: nextServices } = await supabase
        .from("services")
        .select("start_time")
        .eq("day_of_week", nextDow)
        .eq("is_active", true)
        .order("start_time")
        .limit(1);

      if (nextServices && nextServices.length > 0) {
        const t = nextServices[0].start_time.slice(0, 5);
        const label =
          offset === 1
            ? `Demain à ${t}`
            : `${DAY_NAMES[nextDow]} à ${t}`;
        return { isOpen: false, nextLabel: `Fermé · Prochain service ${label}` };
      }
    }

    return { isOpen: false, nextLabel: "Fermé" };
  } catch {
    return { isOpen: false };
  }
}

interface OpenStatusBadgeProps {
  className?: string;
}

export async function OpenStatusBadge({ className }: OpenStatusBadgeProps) {
  const status = await getOpenStatus();

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium",
        status.isOpen
          ? "bg-algue/10 text-algue ring-1 ring-algue/30"
          : "bg-kraft/15 text-encre/70 ring-1 ring-kraft/40",
        className
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full",
          status.isOpen ? "bg-algue animate-pulse" : "bg-kraft"
        )}
      />
      {status.isOpen ? (
        <>
          <span>Ouvert maintenant</span>
          {status.serviceName && (
            <span className="opacity-70">· {status.serviceName}</span>
          )}
        </>
      ) : (
        <span>{status.nextLabel ?? "Fermé"}</span>
      )}
    </span>
  );
}
