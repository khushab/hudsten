/**
 * Supabase generated types — Hudsten public schema.
 *
 * ⚠️ REGENERATE this file from the live DB after applying migrations:
 *     pnpm db:types     (→ supabase gen types typescript --linked)
 *
 * This hand-authored version mirrors supabase/migrations exactly so the repository
 * layer and both apps are fully typed before the first generation. It is a drop-in
 * for the generated output (same Database shape).
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string;
          role: Database["public"]["Enums"]["user_role"];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string;
          role?: Database["public"]["Enums"]["user_role"];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          role?: Database["public"]["Enums"]["user_role"];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      product_types: {
        Row: {
          id: string;
          name: string;
          spec_schema: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          spec_schema?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          spec_schema?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          parent_id: string | null;
          description: string | null;
          image_url: string | null;
          meta_title: string | null;
          meta_description: string | null;
          position: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          parent_id?: string | null;
          description?: string | null;
          image_url?: string | null;
          meta_title?: string | null;
          meta_description?: string | null;
          position?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["categories"]["Insert"]>;
        Relationships: [];
      };
      collections: {
        Row: {
          id: string;
          name: string;
          slug: string;
          type: Database["public"]["Enums"]["collection_type"];
          rules: Json | null;
          description: string | null;
          image_url: string | null;
          meta_title: string | null;
          meta_description: string | null;
          position: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          slug: string;
          type?: Database["public"]["Enums"]["collection_type"];
          rules?: Json | null;
          description?: string | null;
          image_url?: string | null;
          meta_title?: string | null;
          meta_description?: string | null;
          position?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["collections"]["Insert"]>;
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          title: string;
          slug: string;
          description: string | null;
          product_type_id: string;
          category_id: string | null;
          gender: Database["public"]["Enums"]["gender_enum"];
          price: number;
          compare_at_price: number | null;
          currency: string;
          status: Database["public"]["Enums"]["product_status"];
          in_stock: boolean;
          specs: Json;
          whatsapp_message_template: string | null;
          amazon_url: string | null;
          is_featured: boolean;
          badges: string[];
          meta_title: string | null;
          meta_description: string | null;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          description?: string | null;
          product_type_id: string;
          category_id?: string | null;
          gender?: Database["public"]["Enums"]["gender_enum"];
          price: number;
          compare_at_price?: number | null;
          currency?: string;
          status?: Database["public"]["Enums"]["product_status"];
          in_stock?: boolean;
          specs?: Json;
          whatsapp_message_template?: string | null;
          amazon_url?: string | null;
          is_featured?: boolean;
          badges?: string[];
          meta_title?: string | null;
          meta_description?: string | null;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: [];
      };
      product_collections: {
        Row: {
          product_id: string;
          collection_id: string;
          position: number;
          created_at: string;
        };
        Insert: {
          product_id: string;
          collection_id: string;
          position?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_collections"]["Insert"]>;
        Relationships: [];
      };
      tags: {
        Row: { id: string; name: string; slug: string; created_at: string };
        Insert: { id?: string; name: string; slug: string; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["tags"]["Insert"]>;
        Relationships: [];
      };
      product_tags: {
        Row: { product_id: string; tag_id: string };
        Insert: { product_id: string; tag_id: string };
        Update: Partial<Database["public"]["Tables"]["product_tags"]["Insert"]>;
        Relationships: [];
      };
      product_options: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          name: string;
          position?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_options"]["Insert"]>;
        Relationships: [];
      };
      product_option_values: {
        Row: {
          id: string;
          option_id: string;
          value: string;
          color_hex: string | null;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          option_id: string;
          value: string;
          color_hex?: string | null;
          position?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_option_values"]["Insert"]>;
        Relationships: [];
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          title: string;
          sku: string | null;
          price: number | null;
          compare_at_price: number | null;
          in_stock: boolean;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          title: string;
          sku?: string | null;
          price?: number | null;
          compare_at_price?: number | null;
          in_stock?: boolean;
          position?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_variants"]["Insert"]>;
        Relationships: [];
      };
      variant_option_values: {
        Row: { variant_id: string; option_value_id: string };
        Insert: { variant_id: string; option_value_id: string };
        Update: Partial<Database["public"]["Tables"]["variant_option_values"]["Insert"]>;
        Relationships: [];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          url: string;
          alt_text: string | null;
          position: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          url: string;
          alt_text?: string | null;
          position?: number;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["product_images"]["Insert"]>;
        Relationships: [];
      };
      image_option_values: {
        Row: { image_id: string; option_value_id: string };
        Insert: { image_id: string; option_value_id: string };
        Update: Partial<Database["public"]["Tables"]["image_option_values"]["Insert"]>;
        Relationships: [];
      };
      navigation_menu: {
        Row: {
          id: string;
          label: string;
          link_type: Database["public"]["Enums"]["nav_link_type"];
          link_target: string | null;
          parent_id: string | null;
          position: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          label: string;
          link_type: Database["public"]["Enums"]["nav_link_type"];
          link_target?: string | null;
          parent_id?: string | null;
          position?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["navigation_menu"]["Insert"]>;
        Relationships: [];
      };
      settings: {
        Row: {
          id: number;
          store_name: string;
          logo_url: string | null;
          announcement_bar: string | null;
          whatsapp_number: string | null;
          whatsapp_default_message_template: string | null;
          hero: Json;
          featured_collection_id: string | null;
          contact_email: string | null;
          phone: string | null;
          address: string | null;
          gst_number: string | null;
          social: Json;
          policies: Json;
          updated_at: string;
        };
        Insert: {
          id?: number;
          store_name?: string;
          logo_url?: string | null;
          announcement_bar?: string | null;
          whatsapp_number?: string | null;
          whatsapp_default_message_template?: string | null;
          hero?: Json;
          featured_collection_id?: string | null;
          contact_email?: string | null;
          phone?: string | null;
          address?: string | null;
          gst_number?: string | null;
          social?: Json;
          policies?: Json;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["settings"]["Insert"]>;
        Relationships: [];
      };
      reviews: {
        Row: {
          id: string;
          product_id: string;
          author_name: string;
          rating: number;
          title: string | null;
          body: string | null;
          is_published: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          author_name: string;
          rating: number;
          title?: string | null;
          body?: string | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["reviews"]["Insert"]>;
        Relationships: [];
      };
      newsletter_subscribers: {
        Row: { id: string; email: string; source: string | null; created_at: string };
        Insert: { id?: string; email: string; source?: string | null; created_at?: string };
        Update: Partial<Database["public"]["Tables"]["newsletter_subscribers"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_admin: {
        Args: Record<string, never>;
        Returns: boolean;
      };
    };
    Enums: {
      gender_enum: "men" | "women" | "unisex";
      product_status: "draft" | "active" | "archived";
      collection_type: "manual" | "smart";
      nav_link_type: "category" | "collection" | "url" | "dropdown_parent";
      user_role: "admin" | "customer";
    };
    CompositeTypes: Record<string, never>;
  };
}

// ── Convenience helpers (mirror Supabase's generated helpers) ────────────────
type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];
export type Enums<T extends keyof PublicSchema["Enums"]> =
  PublicSchema["Enums"][T];
