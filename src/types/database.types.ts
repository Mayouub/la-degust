// Généré manuellement — remplacer par :
// npx supabase gen types typescript --project-id <project-id> > src/types/database.types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      establishment_settings: {
        Row: {
          id: number
          name: string
          address: string | null
          phone: string | null
          email: string | null
          description: string | null
          latitude: number | null
          longitude: number | null
          online_booking_enabled: boolean
          online_ordering_enabled: boolean
          updated_at: string
        }
        Insert: {
          id?: number
          name: string
          address?: string | null
          phone?: string | null
          email?: string | null
          description?: string | null
          latitude?: number | null
          longitude?: number | null
          online_booking_enabled?: boolean
          online_ordering_enabled?: boolean
          updated_at?: string
        }
        Update: {
          id?: number
          name?: string
          address?: string | null
          phone?: string | null
          email?: string | null
          description?: string | null
          latitude?: number | null
          longitude?: number | null
          online_booking_enabled?: boolean
          online_ordering_enabled?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      exceptional_closures: {
        Row: {
          id: string
          date_start: string
          date_end: string
          reason: string | null
        }
        Insert: {
          id?: string
          date_start: string
          date_end: string
          reason?: string | null
        }
        Update: {
          id?: string
          date_start?: string
          date_end?: string
          reason?: string | null
        }
        Relationships: []
      }
      opening_hours: {
        Row: {
          id: number
          day_of_week: number
          is_closed: boolean
        }
        Insert: {
          id?: number
          day_of_week: number
          is_closed?: boolean
        }
        Update: {
          id?: number
          day_of_week?: number
          is_closed?: boolean
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          product_name_snapshot: string
          unit_price_cents: number
          quantity: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          product_name_snapshot: string
          unit_price_cents: number
          quantity: number
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          product_name_snapshot?: string
          unit_price_cents?: number
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          id: string
          created_at: string
          customer_name: string
          customer_phone: string
          customer_email: string | null
          pickup_date: string
          pickup_time: string
          total_cents: number
          status: Database["public"]["Enums"]["order_status"]
          paid_on_site: boolean
          notes: string | null
          public_token: string
        }
        Insert: {
          id?: string
          created_at?: string
          customer_name: string
          customer_phone: string
          customer_email?: string | null
          pickup_date: string
          pickup_time: string
          total_cents: number
          status?: Database["public"]["Enums"]["order_status"]
          paid_on_site?: boolean
          notes?: string | null
          public_token?: string
        }
        Update: {
          id?: string
          created_at?: string
          customer_name?: string
          customer_phone?: string
          customer_email?: string | null
          pickup_date?: string
          pickup_time?: string
          total_cents?: number
          status?: Database["public"]["Enums"]["order_status"]
          paid_on_site?: boolean
          notes?: string | null
          public_token?: string
        }
        Relationships: []
      }
      pickup_slots: {
        Row: {
          id: string
          day_of_week: number
          start_time: string
          end_time: string
          max_orders: number
          is_active: boolean
        }
        Insert: {
          id?: string
          day_of_week: number
          start_time: string
          end_time: string
          max_orders: number
          is_active?: boolean
        }
        Update: {
          id?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
          max_orders?: number
          is_active?: boolean
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          id: string
          name: string
          sort_order: number
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          sort_order?: number
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          sort_order?: number
          is_active?: boolean
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          category_id: string
          name: string
          description: string | null
          image_url: string | null
          unit_label: string
          price_cents: number
          is_available: boolean
          stock_quantity: number | null
          sort_order: number
        }
        Insert: {
          id?: string
          category_id: string
          name: string
          description?: string | null
          image_url?: string | null
          unit_label: string
          price_cents: number
          is_available?: boolean
          stock_quantity?: number | null
          sort_order?: number
        }
        Update: {
          id?: string
          category_id?: string
          name?: string
          description?: string | null
          image_url?: string | null
          unit_label?: string
          price_cents?: number
          is_available?: boolean
          stock_quantity?: number | null
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["user_role"]
          full_name: string
          phone: string | null
          created_at: string
        }
        Insert: {
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          full_name: string
          phone?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          full_name?: string
          phone?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reservations: {
        Row: {
          id: string
          created_at: string
          customer_name: string
          customer_phone: string
          customer_email: string | null
          party_size: number
          reservation_date: string
          reservation_time: string
          service_id: string
          status: Database["public"]["Enums"]["reservation_status"]
          notes: string | null
          source: Database["public"]["Enums"]["reservation_source"]
          created_by: string | null
          public_token: string
        }
        Insert: {
          id?: string
          created_at?: string
          customer_name: string
          customer_phone: string
          customer_email?: string | null
          party_size: number
          reservation_date: string
          reservation_time: string
          service_id: string
          status?: Database["public"]["Enums"]["reservation_status"]
          notes?: string | null
          source?: Database["public"]["Enums"]["reservation_source"]
          created_by?: string | null
          public_token?: string
        }
        Update: {
          id?: string
          created_at?: string
          customer_name?: string
          customer_phone?: string
          customer_email?: string | null
          party_size?: number
          reservation_date?: string
          reservation_time?: string
          service_id?: string
          status?: Database["public"]["Enums"]["reservation_status"]
          notes?: string | null
          source?: Database["public"]["Enums"]["reservation_source"]
          created_by?: string | null
          public_token?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservations_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          id: string
          name: string
          day_of_week: number
          start_time: string
          end_time: string
          max_covers: number
          slot_duration_minutes: number
          table_duration_minutes: number
          is_active: boolean
        }
        Insert: {
          id?: string
          name: string
          day_of_week: number
          start_time: string
          end_time: string
          max_covers: number
          slot_duration_minutes?: number
          table_duration_minutes?: number
          is_active?: boolean
        }
        Update: {
          id?: string
          name?: string
          day_of_week?: number
          start_time?: string
          end_time?: string
          max_covers?: number
          slot_duration_minutes?: number
          table_duration_minutes?: number
          is_active?: boolean
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      is_admin: {
        Args: Record<string, never>
        Returns: boolean
      }
      check_and_create_reservation: {
        Args: {
          p_service_id: string
          p_date: string
          p_time: string
          p_party_size: number
          p_customer_name: string
          p_customer_phone: string
          p_customer_email?: string | null
          p_notes?: string | null
        }
        Returns: Json
      }
    }
    Enums: {
      order_status: "pending" | "confirmed" | "ready" | "collected" | "cancelled"
      reservation_source: "online" | "phone" | "walk_in"
      reservation_status: "pending" | "confirmed" | "honored" | "no_show" | "cancelled"
      user_role: "admin" | "staff"
    }
    CompositeTypes: Record<string, never>
  }
}

// ── Helpers ──────────────────────────────────────────────────────────────────

type PublicSchema = Database["public"]

export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"]

export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"]

export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"]

export type Enums<T extends keyof PublicSchema["Enums"]> =
  PublicSchema["Enums"][T]
