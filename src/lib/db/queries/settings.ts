import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { TablesUpdate } from "@/types/database.types";

export async function getSettings() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("establishment_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateSettings(
  updates: TablesUpdate<"establishment_settings">
) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("establishment_settings")
    .update(updates)
    .eq("id", 1)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
