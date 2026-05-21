import { createClient, createAdminClient } from "@/lib/supabase/server";
import type {
  Tables,
  TablesInsert,
  Enums,
} from "@/types/database.types";

// ── Types ─────────────────────────────────────────────────────────────────────

export type Order = Tables<"orders">;
export type OrderItem = Tables<"order_items">;

export type OrderItemInput = {
  product_id: string | null;
  product_name_snapshot: string;
  unit_price_cents: number;
  quantity: number;
};

export type CreateOrderPayload = Omit<
  TablesInsert<"orders">,
  "total_cents" | "id" | "created_at" | "public_token"
> & {
  items: OrderItemInput[];
};

export type OrderWithItems = Order & { order_items: OrderItem[] };

export type OrderFilters = {
  date?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: Enums<"order_status">;
};

// ── Création ──────────────────────────────────────────────────────────────────

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const supabase = await createClient();

  const total_cents = payload.items.reduce(
    (sum, item) => sum + item.unit_price_cents * item.quantity,
    0
  );

  const { items, ...orderFields } = payload;

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({ ...orderFields, total_cents })
    .select()
    .single();

  if (orderError) throw new Error(orderError.message);

  const itemRows: TablesInsert<"order_items">[] = items.map((item) => ({
    order_id: order.id,
    product_id: item.product_id,
    product_name_snapshot: item.product_name_snapshot,
    unit_price_cents: item.unit_price_cents,
    quantity: item.quantity,
  }));

  const { error: itemsError } = await supabase
    .from("order_items")
    .insert(itemRows);

  if (itemsError) throw new Error(itemsError.message);

  return order;
}

// ── Lecture admin ─────────────────────────────────────────────────────────────

export async function listOrders(filters: OrderFilters = {}) {
  const supabase = createAdminClient();
  let query = supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("pickup_date", { ascending: false })
    .order("pickup_time");

  if (filters.date)     query = query.eq("pickup_date", filters.date);
  if (filters.dateFrom) query = query.gte("pickup_date", filters.dateFrom);
  if (filters.dateTo)   query = query.lte("pickup_date", filters.dateTo);
  if (filters.status)   query = query.eq("status", filters.status);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data as OrderWithItems[];
}

export async function getOrderById(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data as OrderWithItems;
}

// ── Lecture publique par token ────────────────────────────────────────────────

export async function getOrderByToken(token: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("public_token", token)
    .single();

  if (error) throw new Error(error.message);
  return data as OrderWithItems;
}

// ── Mise à jour admin ────────────────────────────────────────────────────────

export async function updateOrderStatus(
  id: string,
  status: Enums<"order_status">
) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function markOrderPaidOnSite(id: string) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .update({ paid_on_site: true })
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

// ── Créneaux de retrait ───────────────────────────────────────────────────────

export async function listPickupSlots(dayOfWeek?: number) {
  const supabase = await createClient();
  let query = supabase
    .from("pickup_slots")
    .select("*")
    .eq("is_active", true)
    .order("day_of_week")
    .order("start_time");

  if (dayOfWeek !== undefined) query = query.eq("day_of_week", dayOfWeek);

  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return data;
}

export async function getAvailablePickupSlots(date: string) {
  const dayOfWeek = new Date(date).getDay(); // 0=dim, 1=lun …
  const supabase = await createClient();

  const { data: slots, error: slotsError } = await supabase
    .from("pickup_slots")
    .select("*")
    .eq("day_of_week", dayOfWeek)
    .eq("is_active", true)
    .order("start_time");

  if (slotsError) throw new Error(slotsError.message);

  const { data: orders, error: ordersError } = await supabase
    .from("orders")
    .select("pickup_time")
    .eq("pickup_date", date)
    .in("status", ["pending", "confirmed", "ready"]);

  if (ordersError) throw new Error(ordersError.message);

  const countBySlot: Record<string, number> = {};
  for (const o of orders ?? []) {
    countBySlot[o.pickup_time] = (countBySlot[o.pickup_time] ?? 0) + 1;
  }

  return (slots ?? []).map((slot) => ({
    ...slot,
    booked: countBySlot[slot.start_time] ?? 0,
    available: Math.max(0, slot.max_orders - (countBySlot[slot.start_time] ?? 0)),
  }));
}
