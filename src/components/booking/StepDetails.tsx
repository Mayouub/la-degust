"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Loader2Icon, ArrowLeftIcon } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ── Schéma de validation ──────────────────────────────────────────────────────

const phoneRegex = /^(?:\+33|0033|0)[1-9][0-9\s.\-]{7,}$/;

export const detailsSchema = z.object({
  customerName: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères"),
  customerPhone: z
    .string()
    .min(10, "Numéro trop court")
    .refine(
      (v) => phoneRegex.test(v.replace(/\s/g, "")),
      "Numéro de téléphone invalide (ex. 06 12 34 56 78)"
    ),
  customerEmail: z.string().email("Adresse e-mail invalide"),
  notes: z.string().optional(),
  rgpd: z
    .boolean()
    .refine((v) => v === true, "Vous devez accepter pour continuer"),
});

export type DetailsFormValues = {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  notes?: string;
  rgpd: boolean;
};

// ── Props ─────────────────────────────────────────────────────────────────────

type Props = {
  date: Date;
  time: string;
  partySize: number;
  serviceName: string;
  isSubmitting: boolean;
  onSubmit: (values: DetailsFormValues) => void;
  onBack: () => void;
};

// ── Composant ─────────────────────────────────────────────────────────────────

export function StepDetails({
  date,
  time,
  partySize,
  serviceName,
  isSubmitting,
  onSubmit,
  onBack,
}: Props) {
  const form = useForm<DetailsFormValues>({
    resolver: zodResolver(detailsSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerEmail: "",
      notes: "",
      rgpd: false,
    },
  });

  const formattedDate = format(date, "EEEE d MMMM yyyy", { locale: fr });
  const capitalDate =
    formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-8 items-start">
      {/* Formulaire */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          {/* Retour */}
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-marine/60 hover:text-marine transition-colors mb-2"
          >
            <ArrowLeftIcon className="size-4" />
            Modifier le créneau
          </button>

          <FormField
            control={form.control}
            name="customerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-marine">Nom complet</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Jean Dupont"
                    className="bg-papier border-kraft/40 focus:border-marine"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="customerPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-marine">
                  Téléphone <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="06 12 34 56 78"
                    className="bg-papier border-kraft/40 focus:border-marine"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="customerEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-marine">
                  E-mail <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="jean@exemple.fr"
                    className="bg-papier border-kraft/40 focus:border-marine"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-marine">
                  Commentaire{" "}
                  <span className="text-marine/40 font-normal">(optionnel)</span>
                </FormLabel>
                <FormControl>
                  <textarea
                    rows={3}
                    placeholder="Allergie, occasion spéciale, table en terrasse…"
                    className={cn(
                      "w-full rounded-md border border-kraft/40 bg-papier px-3 py-2 text-sm",
                      "placeholder:text-muted-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-marine/30 focus:border-marine",
                      "resize-none transition-colors"
                    )}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* RGPD */}
          <FormField
            control={form.control}
            name="rgpd"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="rgpd"
                    checked={field.value === true}
                    onChange={(e) =>
                      field.onChange(e.target.checked ? true : undefined)
                    }
                    className="mt-0.5 size-4 accent-marine cursor-pointer"
                  />
                  <label
                    htmlFor="rgpd"
                    className="text-sm text-marine/70 leading-relaxed cursor-pointer"
                  >
                    J'accepte que mes informations soient utilisées pour gérer
                    ma réservation, conformément à la politique de
                    confidentialité.{" "}
                    <span className="text-red-500">*</span>
                  </label>
                </div>
                <FormMessage className="ml-7" />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-marine text-beurre hover:bg-encre transition-all h-12 text-base font-semibold"
          >
            {isSubmitting ? (
              <>
                <Loader2Icon className="size-5 animate-spin mr-2" />
                Confirmation en cours…
              </>
            ) : (
              "Confirmer ma réservation"
            )}
          </Button>
        </form>
      </Form>

      {/* Récapitulatif sticky */}
      <aside className="lg:sticky lg:top-24 rounded-xl border border-kraft/30 bg-marine/5 p-5 space-y-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-marine/50">
          Votre réservation
        </p>
        <div className="space-y-3">
          <RecapRow label="Date" value={capitalDate} />
          <RecapRow label="Heure" value={time} />
          <RecapRow label="Service" value={serviceName} />
          <RecapRow
            label="Couverts"
            value={`${partySize} personne${partySize > 1 ? "s" : ""}`}
          />
        </div>
      </aside>
    </div>
  );
}

function RecapRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-baseline gap-2">
      <span className="text-xs text-marine/50">{label}</span>
      <span className="text-sm font-semibold text-marine text-right">{value}</span>
    </div>
  );
}
