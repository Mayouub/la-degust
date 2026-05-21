import { Suspense } from "react";
import { MapPin, Phone, Clock } from "lucide-react";
import { OpenStatusBadge } from "@/components/ui/open-status-badge";
import { GoogleMap } from "./GoogleMap";
import { ScrollFadeIn } from "./ScrollFadeIn";
import type { Tables } from "@/types/database.types";

type Settings = Tables<"establishment_settings">;
type OpeningHour = Tables<"opening_hours">;
type Service = Tables<"services">;

interface Props {
  settings: Settings | null;
  openingHours: OpeningHour[];
  services: Service[];
}

const DAY_FULL = [
  "Dimanche",
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
];

function fmt(t: string) {
  return t.slice(0, 5).replace(":", "h");
}

function buildSchedule(hours: OpeningHour[], services: Service[]) {
  // Show Mon–Sun (1..7 mod 7)
  const order = [1, 2, 3, 4, 5, 6, 0];
  return order.map((dow) => {
    const oh = hours.find((h) => h.day_of_week === dow);
    const dayServices = services
      .filter((s) => s.day_of_week === dow)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));

    const closed = oh?.is_closed ?? dayServices.length === 0;
    return { dow, label: DAY_FULL[dow], closed, services: dayServices };
  });
}

export function LocationBlock({ settings, openingHours, services }: Props) {
  const schedule = buildSchedule(openingHours, services);
  const lat = settings?.latitude ?? 46.674;
  const lng = settings?.longitude ?? -1.431;
  const address = settings?.address ?? "Marais poitevin, Vendée";
  const phone = settings?.phone ?? null;

  return (
    <section
      id="lieu"
      className="bg-sable py-20 md:py-28"
      aria-labelledby="location-title"
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <ScrollFadeIn>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div>
              <p className="font-hand text-kraft text-xl mb-2">Nous trouver</p>
              <h2
                id="location-title"
                className="font-display text-marine text-4xl sm:text-5xl uppercase leading-tight"
              >
                Le Lieu
              </h2>
            </div>
            <Suspense>
              <OpenStatusBadge />
            </Suspense>
          </div>
        </ScrollFadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14">
          {/* Left: info + horaires */}
          <ScrollFadeIn>
            <div className="space-y-8">
              {/* Address & phone */}
              <div className="space-y-4">
                <div className="flex gap-3">
                  <MapPin
                    className="text-marine mt-0.5 shrink-0"
                    size={20}
                    aria-hidden
                  />
                  <div>
                    <p className="font-semibold text-encre">
                      {settings?.name ?? "La Dégust' du Grand Coin"}
                    </p>
                    <p className="text-encre/70 whitespace-pre-line text-sm">{address}</p>
                  </div>
                </div>

                {phone && (
                  <div className="flex gap-3 items-center">
                    <Phone
                      className="text-marine shrink-0"
                      size={20}
                      aria-hidden
                    />
                    <a
                      href={`tel:${phone.replace(/\s/g, "")}`}
                      className="text-marine font-semibold hover:underline"
                    >
                      {phone}
                    </a>
                  </div>
                )}
              </div>

              {/* Horaires */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="text-marine" size={20} aria-hidden />
                  <h3 className="font-semibold text-encre text-base">
                    Horaires d&apos;ouverture
                  </h3>
                </div>
                <table className="w-full text-sm" aria-label="Horaires d&apos;ouverture">
                  <tbody>
                    {schedule.map(({ dow, label, closed, services: svcs }) => (
                      <tr
                        key={dow}
                        className="border-b border-kraft/30 last:border-0"
                      >
                        <td className="py-2.5 pr-4 font-medium text-encre w-28">
                          {label}
                        </td>
                        <td className="py-2.5 text-encre/70">
                          {closed ? (
                            <span className="text-kraft font-medium">Fermé</span>
                          ) : svcs.length > 0 ? (
                            <span className="flex flex-wrap gap-x-3 gap-y-1">
                              {svcs.map((s) => (
                                <span key={s.id}>
                                  {s.name
                                    ? `${s.name} : `
                                    : ""}
                                  {fmt(s.start_time)}–{fmt(s.end_time)}
                                </span>
                              ))}
                            </span>
                          ) : (
                            <span className="text-kraft font-medium">Fermé</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </ScrollFadeIn>

          {/* Right: map */}
          <ScrollFadeIn delay={150}>
            <GoogleMap
              lat={lat as number}
              lng={lng as number}
              name={settings?.name ?? undefined}
              className="w-full h-72 lg:h-full min-h-[300px] rounded-2xl"
            />
          </ScrollFadeIn>
        </div>
      </div>
    </section>
  );
}
