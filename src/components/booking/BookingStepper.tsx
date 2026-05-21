"use client";

import { cn } from "@/lib/utils";
import { CheckIcon } from "lucide-react";

const STEPS = [
  { number: 1, label: "Date & couverts" },
  { number: 2, label: "Créneau" },
  { number: 3, label: "Coordonnées" },
] as const;

type Props = {
  currentStep: 1 | 2 | 3;
};

export function BookingStepper({ currentStep }: Props) {
  return (
    <nav aria-label="Étapes de réservation" className="mb-8">
      <ol className="flex items-center gap-0">
        {STEPS.map((step, idx) => {
          const isDone = step.number < currentStep;
          const isActive = step.number === currentStep;

          return (
            <li key={step.number} className="flex items-center flex-1">
              {/* Bubble */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "size-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 shrink-0",
                    isDone &&
                      "bg-marine text-beurre",
                    isActive &&
                      "bg-marine text-beurre ring-4 ring-marine/20",
                    !isDone &&
                      !isActive &&
                      "bg-kraft/30 text-marine/40"
                  )}
                >
                  {isDone ? (
                    <CheckIcon className="size-4" />
                  ) : (
                    <span>{step.number}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium text-center hidden sm:block transition-colors",
                    isActive ? "text-marine" : isDone ? "text-marine/70" : "text-marine/30"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector (sauf après le dernier) */}
              {idx < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 mx-2 transition-colors duration-500",
                    step.number < currentStep ? "bg-marine" : "bg-kraft/30"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
