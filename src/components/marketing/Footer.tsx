import Link from "next/link";
import { MapPin, Phone, Mail, Globe, Share2 } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import type { Tables } from "@/types/database.types";

type Settings = Tables<"establishment_settings">;

interface Props {
  settings: Settings | null;
}

export function Footer({ settings }: Props) {
  const year = new Date().getFullYear();
  const name = settings?.name ?? "La Dégust' du Grand Coin";
  const address = settings?.address ?? "Marais poitevin, Vendée";
  const phone = settings?.phone ?? null;
  const email = settings?.email ?? null;

  return (
    <footer
      id="contact"
      className="bg-encre text-sable/80 py-14 md:py-16"
      aria-label="Pied de page"
    >
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Logo variant="beurre" size="md" className="mb-4" />
            <p className="text-sable/60 text-sm leading-relaxed max-w-xs">
              Huîtres élevées dans nos parcs, ouvertes et servies le jour même.
              Du marais poitevin vendéen à votre table.
            </p>
            {/* Réseaux sociaux */}
            <div className="flex gap-3 mt-5">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram — La Dégust' du Grand Coin"
                className="p-2 rounded-lg border border-white/10 text-sable/50 hover:text-beurre hover:border-beurre/30 transition-colors"
              >
                <Globe size={18} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook — La Dégust' du Grand Coin"
                className="p-2 rounded-lg border border-white/10 text-sable/50 hover:text-beurre hover:border-beurre/30 transition-colors"
              >
                <Share2 size={18} />
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-sable text-sm uppercase tracking-wider mb-4">
              Contact
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-2.5">
                <MapPin
                  size={15}
                  className="text-kraft/60 mt-0.5 shrink-0"
                  aria-hidden
                />
                <span className="text-sable/60 whitespace-pre-line">
                  {address}
                </span>
              </li>
              {phone && (
                <li className="flex gap-2.5 items-center">
                  <Phone
                    size={15}
                    className="text-kraft/60 shrink-0"
                    aria-hidden
                  />
                  <a
                    href={`tel:${phone.replace(/\s/g, "")}`}
                    className="text-sable/60 hover:text-beurre transition-colors"
                  >
                    {phone}
                  </a>
                </li>
              )}
              {email && (
                <li className="flex gap-2.5 items-center">
                  <Mail
                    size={15}
                    className="text-kraft/60 shrink-0"
                    aria-hidden
                  />
                  <a
                    href={`mailto:${email}`}
                    className="text-sable/60 hover:text-beurre transition-colors break-all"
                  >
                    {email}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* Horaires résumés */}
          <div>
            <h3 className="font-semibold text-sable text-sm uppercase tracking-wider mb-4">
              Horaires
            </h3>
            <ul className="space-y-1.5 text-sm text-sable/60">
              <li>Mardi – Vendredi : 12h – 21h</li>
              <li>Samedi – Dimanche : 10h – 21h</li>
              <li className="text-kraft/70">Fermé le lundi</li>
            </ul>
            <p className="text-xs text-sable/40 mt-3">
              Horaires susceptibles de varier.
              <br />
              Réservation conseillée.
            </p>
          </div>

          {/* Liens */}
          <div>
            <h3 className="font-semibold text-sable text-sm uppercase tracking-wider mb-4">
              Informations
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                { href: "/reserver", label: "Réserver une table" },
                { href: "/commander", label: "Click & Collect" },
                { href: "/mentions-legales", label: "Mentions légales" },
                { href: "/cgv", label: "CGV" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-sable/60 hover:text-beurre transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-sable/40">
          <p>
            © {year} {name}. Tous droits réservés.
          </p>
          <p>
            Éleveur d&apos;huîtres en Vendée · Marais poitevin
          </p>
        </div>
      </div>
    </footer>
  );
}
