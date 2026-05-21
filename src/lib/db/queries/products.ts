import { createClient, createAdminClient } from "@/lib/supabase/server";
import type { Tables, TablesInsert, TablesUpdate } from "@/types/database.types";

// ── Types ─────────────────────────────────────────────────────────────────────

export type Product = Tables<"products">;
export type ProductCategory = Tables<"product_categories">;

export type ProductWithCategory = Product & {
  product_categories: ProductCategory;
};

export type CategoryWithProducts = ProductCategory & {
  products: Product[];
};

// ── Lecture publique ──────────────────────────────────────────────────────────

export async function listProductCategories() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (error) throw new Error(error.message);
  return data;
}

export async function listAvailableProducts() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_categories(*)")
    .eq("is_available", true)
    .order("sort_order");

  if (error) throw new Error(error.message);
  return data as ProductWithCategory[];
}

export async function listProductsByCatalog(): Promise<CategoryWithProducts[]> {
  const supabase = await createClient();
  const { data: categories, error: catError } = await supabase
    .from("product_categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  if (catError) throw new Error(catError.message);

  const { data: products, error: prodError } = await supabase
    .from("products")
    .select("*")
    .eq("is_available", true)
    .order("sort_order");

  if (prodError) throw new Error(prodError.message);

  return (categories ?? []).map((cat) => ({
    ...cat,
    products: (products ?? []).filter((p) => p.category_id === cat.id),
  }));
}

export async function getProductById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, product_categories(*)")
    .eq("id", id)
    .single();

  if (error) throw new Error(error.message);
  return data as ProductWithCategory;
}

// ── Écriture admin ────────────────────────────────────────────────────────────

export async function createProduct(payload: TablesInsert<"products">) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateProduct(id: string, updates: TablesUpdate<"products">) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("products")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function updateProductAvailability(id: string, isAvailable: boolean) {
  return updateProduct(id, { is_available: isAvailable });
}

export async function updateProductStock(id: string, quantity: number | null) {
  return updateProduct(id, { stock_quantity: quantity });
}

export async function createProductCategory(payload: TablesInsert<"product_categories">) {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("product_categories")
    .insert(payload)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}
