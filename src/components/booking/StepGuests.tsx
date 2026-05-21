"use client";

import { PhoneIcon } from "lucide-react";
import { fr } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { OpeningHour, ExceptionalClosure } from "@/lib/booking/availability";
import { isDateDisabled } from "@/lib/booking/availability";

const PARTY_SIZES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] as const;

type Props = {
  partySize: number | null;
  date: Date | null;
  openingHours: OpeningHour[];
  exceptionalClosures: ExceptionalClosure[];
  onPartySizeChange: (n: number) => void;
  onDateChange: (d: Date) => void;
  onNext: () => void;
};

export function StepGuests({
  partySize,
  date,
  openingHours,
  exceptionalClosures,
  onPartySizeChange,
  onDateChange,
  onNext,
}: Props) {
  const now = new Date();

  function disabled(d: Date) {
    return isDateDisabled(d, openingHours, exceptionalClosures, now);
  }

  const canContinue = partySize !== null && date !== null;

  return (
    <div className="space-y-8">
      {/* Party size */}
      <section>
        <h2 className="text-marine font-semibold text-base mb-3">
          Combien êtes-vous ?
        </h2>
        <div className="flex flex-wrap gap-2">
          {PARTY_SIZES.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => onPartySizeChange(n)}
              className={cn(
                "size-11 rounded-full text-sm font-semibold transition-all duration-150 border",
                partySize === n
                  ? "bg-marine text-beurre border-marine shadow-sm"
                  : "bg-papier text-marine border-kraft/40 hover:border-marine hover:bg-sable"
              )}
            >
              {n}
            </button>
          ))}

          {/* 13+ */}
          <a
            href="tel:+33251680000"
            className={cn(
              "h-11 px-4 rounded-full text-xs font-semibold transition-all duration-150 border",
              "bg-papier text-marine/70 border-kraft/40 hover:border-marine hover:text-marine",
              "flex items-center gap-1.5"
            )}
          >
            <PhoneIcon className="size-3.5" />
            13 et + → nous appeler
          </a>
        </div>
      </section>

      {/* Calendar */}
      <section>
        <h2 className="text-marine font-semibold text-base mb-3">
          Choisissez une date
        </h2>
        <div className="rounded-xl border border-kraft/30 bg-papier p-2 w-fit">
          <Calendar
            mode="single"
            locale={fr}
            selected={date ?? undefined}
            onSelect={(d) => d && onDateChange(d)}
            disabled={(d) =>
              disabled(d) ||
              d > new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
            }
            startMonth={new Date()}
            classNames={{
              today: "bg-beurre/60 text-marine rounded-md",
            }}
          />
        </div>
      </section>

      <Button
        onClick={onNext}
        disabled={!canContinue}
        className={cn(
          "w-full sm:w-auto px-8 bg-marine text-beurre hover:bg-encre transition-all",
          !canContinue && "opacity-40 cursor-not-allowed"
        )}
      >
        Suivant →
      </Button>
    </div>
  );
}
