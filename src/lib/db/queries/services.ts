import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert, TablesUpdate } from "@/types/database.types";

export async function listActiveServices() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("is_active", true)
    .order("day_of_week")
    .order("start_time");

  if (error) throw new Error(error.message);
  return data;
}

export async function getServicesByDay(dayOfWeek: number) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("day_of_week", dayOfWeek)
    .eq("is_active", true)
    .order("start_time");

  if (error) throw new Error(error.message);
  return data;
}

export async function getServiceById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("services")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function createService(payload: TablesInsert<"services">) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("services")
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateService(id: string, updates: TablesUpdate<"services">) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("services")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getOpeningHours() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("opening_hours")
    .select("*")
    .order("day_of_week");

  if (error) throw new Error(error.message);
  return data;
}

export async function getExceptionalClosures(from?: string, to?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("exceptional_closures")
    .select("*")
    .order("date_start");

  if (from) query = query.gte("date_end", from);
  if (to)   query = query.lte("date_start", to);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function isDateExceptionallyClosed(date: string): Promise<boolean> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("exceptional_closures")
    .select("id")
    .lte("date_start", date)
    .gte("date_end", date)
    .limit(1);

  if (error) throw new Error(error.message);
  return data.length > 0;
}

// ── Types utilitaires ─────────────────────────────────────────────────────────

export type Service = Tables<"services">;
export type OpeningHour = Tables<"opening_hours">;
