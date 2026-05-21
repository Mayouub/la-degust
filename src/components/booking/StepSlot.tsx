"use client";

import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowLeftIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { ServiceWithSlots } from "@/lib/booking/availability";

type Props = {
  date: Date;
  partySize: number;
  servicesWithSlots: ServiceWithSlots[];
  isLoading: boolean;
  error: string | null;
  selectedServiceId: string | null;
  selectedTime: string | null;
  onSelectSlot: (serviceId: string, serviceName: string, time: string) => void;
  onBack: () => void;
};

export function StepSlot({
  date,
  partySize,
  servicesWithSlots,
  isLoading,
  error,
  selectedServiceId,
  selectedTime,
  onSelectSlot,
  onBack,
}: Props) {
  const formattedDate = format(date, "EEEE d MMMM", { locale: fr });
  const capitalDate =
    formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return (
    <div className="space-y-6">
      {/* Contexte */}
      <div className="flex items-center gap-3 text-sm text-marine/70">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 hover:text-marine transition-colors"
        >
          <ArrowLeftIcon className="size-4" />
          Modifier
        </button>
        <span>·</span>
        <span className="font-medium text-marine">{capitalDate}</span>
        <span>·</span>
        <span>
          {partySize} couvert{partySize > 1 ? "s" : ""}
        </span>
      </div>

      <h2 className="text-marine font-semibold text-base">
        Choisissez un créneau
      </h2>

      {/* Chargement */}
      {isLoading && (
        <div className="space-y-4">
          <Skeleton className="h-5 w-32" />
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-16 rounded-full" />
            ))}
          </div>
        </div>
      )}

      {/* Erreur */}
      {!isLoading && error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Aucun service ce jour */}
      {!isLoading && !error && servicesWithSlots.length === 0 && (
        <div className="rounded-xl border border-kraft/30 bg-sable px-6 py-8 text-center">
          <p className="text-marine font-semibold mb-1">
            Aucun service disponible ce jour-là
          </p>
          <p className="text-marine/60 text-sm">
            Choisissez une autre date.
          </p>
          <Button variant="outline" onClick={onBack} className="mt-4">
            ← Changer de date
          </Button>
        </div>
      )}

      {/* Services avec créneaux */}
      {!isLoading &&
        !error &&
        servicesWithSlots.map(({ service, slots }) => (
          <section key={service.id}>
            <p className="text-xs font-semibold uppercase tracking-widest text-marine/50 mb-3">
              {service.name}
            </p>

            {slots.length === 0 ? (
              <p className="text-sm text-marine/60 italic">
                Aucun créneau disponible pour ce service.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {slots.map((slot) => {
                  const isSelected =
                    selectedServiceId === service.id &&
                    selectedTime === slot.time;

                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={!slot.isAvailable}
                      onClick={() =>
                        onSelectSlot(service.id, service.name, slot.time)
                      }
                      title={
                        !slot.isAvailable
                          ? `Complet (${slot.booked}/${service.max_covers} couverts)`
                          : undefined
                      }
                      className={cn(
                        "h-10 px-4 rounded-full text-sm font-medium transition-all duration-150 border",
                        isSelected &&
                          "bg-marine text-beurre border-marine shadow",
                        !isSelected &&
                          slot.isAvailable &&
                          "bg-papier text-marine border-kraft/40 hover:border-marine hover:bg-sable",
                        !slot.isAvailable &&
                          "bg-papier/50 text-marine/30 border-kraft/20 cursor-not-allowed line-through"
                      )}
                    >
                      {slot.time}
                      {!slot.isAvailable && (
                        <span className="ml-1 text-xs">complet</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </section>
        ))}
    </div>
  );
}
