"use client";

import { useReducer, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BookingStepper } from "./BookingStepper";
import { StepGuests } from "./StepGuests";
import { StepSlot } from "./StepSlot";
import { StepDetails } from "./StepDetails";
import { createReservationAction } from "@/lib/actions/reservations";
import type { OpeningHour, ExceptionalClosure, ServiceWithSlots } from "@/lib/booking/availability";
import type { DetailsFormValues } from "./StepDetails";
import { toDateString } from "@/lib/booking/availability";

// ── State machine ─────────────────────────────────────────────────────────────

type BookingState = {
  step: 1 | 2 | 3;
  direction: "forward" | "backward";
  partySize: number | null;
  date: Date | null;
  servicesWithSlots: ServiceWithSlots[];
  isLoadingSlots: boolean;
  slotsError: string | null;
  selectedServiceId: string | null;
  selectedServiceName: string | null;
  selectedTime: string | null;
  isSubmitting: boolean;
};

type BookingAction =
  | { type: "SET_PARTY_SIZE"; payload: number }
  | { type: "SET_DATE"; payload: Date }
  | { type: "NEXT_STEP" }
  | { type: "PREV_STEP" }
  | { type: "SLOTS_LOADING" }
  | { type: "SLOTS_SUCCESS"; payload: ServiceWithSlots[] }
  | { type: "SLOTS_ERROR"; payload: string }
  | { type: "SELECT_SLOT"; payload: { serviceId: string; serviceName: string; time: string } }
  | { type: "SUBMITTING" }
  | { type: "SUBMIT_ERROR" };

const initialState: BookingState = {
  step: 1,
  direction: "forward",
  partySize: null,
  date: null,
  servicesWithSlots: [],
  isLoadingSlots: false,
  slotsError: null,
  selectedServiceId: null,
  selectedServiceName: null,
  selectedTime: null,
  isSubmitting: false,
};

function reducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case "SET_PARTY_SIZE":
      return { ...state, partySize: action.payload };

    case "SET_DATE":
      return {
        ...state,
        date: action.payload,
        // Réinitialise les créneaux si la date change
        servicesWithSlots: [],
        selectedServiceId: null,
        selectedServiceName: null,
        selectedTime: null,
        slotsError: null,
      };

    case "NEXT_STEP":
      return {
        ...state,
        step: Math.min(3, state.step + 1) as 1 | 2 | 3,
        direction: "forward",
      };

    case "PREV_STEP":
      return {
        ...state,
        step: Math.max(1, state.step - 1) as 1 | 2 | 3,
        direction: "backward",
        // Retour de l'étape 2 → réinitialise le slot sélectionné
        ...(state.step === 2
          ? { selectedServiceId: null, selectedServiceName: null, selectedTime: null }
          : {}),
      };

    case "SLOTS_LOADING":
      return {
        ...state,
        isLoadingSlots: true,
        slotsError: null,
        servicesWithSlots: [],
      };

    case "SLOTS_SUCCESS":
      return {
        ...state,
        isLoadingSlots: false,
        servicesWithSlots: action.payload,
      };

    case "SLOTS_ERROR":
      return {
        ...state,
        isLoadingSlots: false,
        slotsError: action.payload,
      };

    case "SELECT_SLOT":
      return {
        ...state,
        selectedServiceId: action.payload.serviceId,
        selectedServiceName: action.payload.serviceName,
        selectedTime: action.payload.time,
        step: 3,
        direction: "forward",
      };

    case "SUBMITTING":
      return { ...state, isSubmitting: true };

    case "SUBMIT_ERROR":
      return { ...state, isSubmitting: false };

    default:
      return state;
  }
}

// ── Composant ─────────────────────────────────────────────────────────────────

type Props = {
  openingHours: OpeningHour[];
  exceptionalClosures: ExceptionalClosure[];
};

export function BookingTunnel({ openingHours, exceptionalClosures }: Props) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const router = useRouter();

  // Fetch créneaux quand on passe à l'étape 2
  const fetchSlots = useCallback(
    async (date: Date, partySize: number) => {
      dispatch({ type: "SLOTS_LOADING" });
      try {
        const res = await fetch(
          `/api/availability?date=${toDateString(date)}&partySize=${partySize}`
        );
        if (!res.ok) throw new Error("Erreur réseau");
        const json: { services: ServiceWithSlots[] } = await res.json();
        dispatch({ type: "SLOTS_SUCCESS", payload: json.services });
      } catch {
        dispatch({
          type: "SLOTS_ERROR",
          payload: "Impossible de charger les créneaux. Veuillez réessayer.",
        });
      }
    },
    []
  );

  useEffect(() => {
    if (state.step === 2 && state.date && state.partySize) {
      fetchSlots(state.date, state.partySize);
    }
  }, [state.step, state.date, state.partySize, fetchSlots]);

  // ── Handlers ────────────────────────────────────────────────────────────────

  async function handleSubmit(values: DetailsFormValues) {
    if (!state.date || !state.selectedTime || !state.selectedServiceId || !state.partySize) {
      return;
    }

    dispatch({ type: "SUBMITTING" });

    const result = await createReservationAction({
      serviceId: state.selectedServiceId,
      serviceName: state.selectedServiceName ?? "",
      date: toDateString(state.date),
      time: state.selectedTime,
      partySize: state.partySize,
      customerName: values.customerName,
      customerPhone: values.customerPhone,
      customerEmail: values.customerEmail,
      notes: values.notes,
    });

    if (!result.success) {
      dispatch({ type: "SUBMIT_ERROR" });

      if (result.error === "slot_full") {
        toast.error(
          "Ce créneau vient d'être pris — désolé ! Sélectionnez un autre créneau.",
          { duration: 6000 }
        );
        // Retour à l'étape 2 pour re-sélectionner
        dispatch({ type: "PREV_STEP" });
        // Rafraîchit les créneaux
        fetchSlots(state.date!, state.partySize!);
      } else {
        toast.error("Une erreur est survenue. Veuillez réessayer.");
      }
      return;
    }

    router.push(`/reserver/confirmation/${result.token}`);
  }

  // ── Rendu ────────────────────────────────────────────────────────────────────

  const animClass =
    state.direction === "forward"
      ? "animate-in slide-in-from-right-8 fade-in duration-300"
      : "animate-in slide-in-from-left-8 fade-in duration-300";

  return (
    <div>
      <BookingStepper currentStep={state.step} />

      <div key={state.step} className={animClass}>
        {state.step === 1 && (
          <StepGuests
            partySize={state.partySize}
            date={state.date}
            openingHours={openingHours}
            exceptionalClosures={exceptionalClosures}
            onPartySizeChange={(n) =>
              dispatch({ type: "SET_PARTY_SIZE", payload: n })
            }
            onDateChange={(d) => dispatch({ type: "SET_DATE", payload: d })}
            onNext={() => dispatch({ type: "NEXT_STEP" })}
          />
        )}

        {state.step === 2 && state.date && state.partySize && (
          <StepSlot
            date={state.date}
            partySize={state.partySize}
            servicesWithSlots={state.servicesWithSlots}
            isLoading={state.isLoadingSlots}
            error={state.slotsError}
            selectedServiceId={state.selectedServiceId}
            selectedTime={state.selectedTime}
            onSelectSlot={(serviceId, serviceName, time) =>
              dispatch({
                type: "SELECT_SLOT",
                payload: { serviceId, serviceName, time },
              })
            }
            onBack={() => dispatch({ type: "PREV_STEP" })}
          />
        )}

        {state.step === 3 &&
          state.date &&
          state.selectedTime &&
          state.partySize &&
          state.selectedServiceName && (
            <StepDetails
              date={state.date}
              time={state.selectedTime}
              partySize={state.partySize}
              serviceName={state.selectedServiceName}
              isSubmitting={state.isSubmitting}
              onSubmit={handleSubmit}
              onBack={() => dispatch({ type: "PREV_STEP" })}
            />
          )}
      </div>
    </div>
  );
}
