export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          meta_description: string | null
          meta_title: string | null
          name: string
          parent_id: string | null
          position: number
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          meta_description?: string | null
          meta_title?: string | null
          name: string
          parent_id?: string | null
          position?: number
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          parent_id?: string | null
          position?: number
          slug?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      collections: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          meta_description: string | null
          meta_title: string | null
          name: string
          position: number
          rules: Json | null
          slug: string
          type: Database["public"]["Enums"]["collection_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          meta_description?: string | null
          meta_title?: string | null
          name: string
          position?: number
          rules?: Json | null
          slug: string
          type?: Database["public"]["Enums"]["collection_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          position?: number
          rules?: Json | null
          slug?: string
          type?: Database["public"]["Enums"]["collection_type"]
          updated_at?: string
        }
        Relationships: []
      }
      image_option_values: {
        Row: {
          image_id: string
          option_value_id: string
        }
        Insert: {
          image_id: string
          option_value_id: string
        }
        Update: {
          image_id?: string
          option_value_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "image_option_values_image_id_fkey"
            columns: ["image_id"]
            isOneToOne: false
            referencedRelation: "product_images"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "image_option_values_option_value_id_fkey"
            columns: ["option_value_id"]
            isOneToOne: false
            referencedRelation: "product_option_values"
            referencedColumns: ["id"]
          },
        ]
      }
      navigation_menu: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          label: string
          link_target: string | null
          link_type: Database["public"]["Enums"]["nav_link_type"]
          parent_id: string | null
          position: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          label: string
          link_target?: string | null
          link_type: Database["public"]["Enums"]["nav_link_type"]
          parent_id?: string | null
          position?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string
          link_target?: string | null
          link_type?: Database["public"]["Enums"]["nav_link_type"]
          parent_id?: string | null
          position?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "navigation_menu_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "navigation_menu"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string | null
        }
        Relationships: []
      }
      product_collections: {
        Row: {
          collection_id: string
          created_at: string
          position: number
          product_id: string
        }
        Insert: {
          collection_id: string
          created_at?: string
          position?: number
          product_id: string
        }
        Update: {
          collection_id?: string
          created_at?: string
          position?: number
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_collections_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_collections_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          id: string
          position: number
          product_id: string
          url: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          id?: string
          position?: number
          product_id: string
          url: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          id?: string
          position?: number
          product_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_option_values: {
        Row: {
          color_hex: string | null
          created_at: string
          id: string
          option_id: string
          position: number
          value: string
        }
        Insert: {
          color_hex?: string | null
          created_at?: string
          id?: string
          option_id: string
          position?: number
          value: string
        }
        Update: {
          color_hex?: string | null
          created_at?: string
          id?: string
          option_id?: string
          position?: number
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_option_values_option_id_fkey"
            columns: ["option_id"]
            isOneToOne: false
            referencedRelation: "product_options"
            referencedColumns: ["id"]
          },
        ]
      }
      product_options: {
        Row: {
          created_at: string
          id: string
          name: string
          position: number
          product_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          position?: number
          product_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          position?: number
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_options_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_tags: {
        Row: {
          product_id: string
          tag_id: string
        }
        Insert: {
          product_id: string
          tag_id: string
        }
        Update: {
          product_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_tags_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      product_types: {
        Row: {
          created_at: string
          id: string
          name: string
          spec_schema: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          spec_schema?: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          spec_schema?: Json
          updated_at?: string
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          compare_at_price: number | null
          created_at: string
          id: string
          in_stock: boolean
          position: number
          price: number | null
          product_id: string
          sku: string | null
          title: string
          updated_at: string
        }
        Insert: {
          compare_at_price?: number | null
          created_at?: string
          id?: string
          in_stock?: boolean
          position?: number
          price?: number | null
          product_id: string
          sku?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          compare_at_price?: number | null
          created_at?: string
          id?: string
          in_stock?: boolean
          position?: number
          price?: number | null
          product_id?: string
          sku?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          amazon_url: string | null
          badges: string[]
          category_id: string | null
          compare_at_price: number | null
          created_at: string
          currency: string
          description: string | null
          gender: Database["public"]["Enums"]["gender_enum"]
          id: string
          in_stock: boolean
          is_featured: boolean
          meta_description: string | null
          meta_title: string | null
          position: number
          price: number
          product_type_id: string
          slug: string
          specs: Json
          status: Database["public"]["Enums"]["product_status"]
          title: string
          updated_at: string
          whatsapp_message_template: string | null
        }
        Insert: {
          amazon_url?: string | null
          badges?: string[]
          category_id?: string | null
          compare_at_price?: number | null
          created_at?: string
          currency?: string
          description?: string | null
          gender?: Database["public"]["Enums"]["gender_enum"]
          id?: string
          in_stock?: boolean
          is_featured?: boolean
          meta_description?: string | null
          meta_title?: string | null
          position?: number
          price: number
          product_type_id: string
          slug: string
          specs?: Json
          status?: Database["public"]["Enums"]["product_status"]
          title: string
          updated_at?: string
          whatsapp_message_template?: string | null
        }
        Update: {
          amazon_url?: string | null
          badges?: string[]
          category_id?: string | null
          compare_at_price?: number | null
          created_at?: string
          currency?: string
          description?: string | null
          gender?: Database["public"]["Enums"]["gender_enum"]
          id?: string
          in_stock?: boolean
          is_featured?: boolean
          meta_description?: string | null
          meta_title?: string | null
          position?: number
          price?: number
          product_type_id?: string
          slug?: string
          specs?: Json
          status?: Database["public"]["Enums"]["product_status"]
          title?: string
          updated_at?: string
          whatsapp_message_template?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_product_type_id_fkey"
            columns: ["product_type_id"]
            isOneToOne: false
            referencedRelation: "product_types"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string
          id: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          author_name: string
          body: string | null
          created_at: string
          id: string
          is_published: boolean
          product_id: string
          rating: number
          title: string | null
          updated_at: string
        }
        Insert: {
          author_name: string
          body?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          product_id: string
          rating: number
          title?: string | null
          updated_at?: string
        }
        Update: {
          author_name?: string
          body?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          product_id?: string
          rating?: number
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          address: string | null
          announcement_bar: string | null
          contact_email: string | null
          delivery_note: string | null
          featured_collection_id: string | null
          gst_number: string | null
          hero: Json
          id: number
          logo_url: string | null
          phone: string | null
          policies: Json
          social: Json
          store_name: string
          updated_at: string
          whatsapp_default_message_template: string | null
          whatsapp_number: string | null
        }
        Insert: {
          address?: string | null
          announcement_bar?: string | null
          contact_email?: string | null
          delivery_note?: string | null
          featured_collection_id?: string | null
          gst_number?: string | null
          hero?: Json
          id?: number
          logo_url?: string | null
          phone?: string | null
          policies?: Json
          social?: Json
          store_name?: string
          updated_at?: string
          whatsapp_default_message_template?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          address?: string | null
          announcement_bar?: string | null
          contact_email?: string | null
          delivery_note?: string | null
          featured_collection_id?: string | null
          gst_number?: string | null
          hero?: Json
          id?: number
          logo_url?: string | null
          phone?: string | null
          policies?: Json
          social?: Json
          store_name?: string
          updated_at?: string
          whatsapp_default_message_template?: string | null
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "settings_featured_collection_id_fkey"
            columns: ["featured_collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string
        }
        Relationships: []
      }
      variant_option_values: {
        Row: {
          option_value_id: string
          variant_id: string
        }
        Insert: {
          option_value_id: string
          variant_id: string
        }
        Update: {
          option_value_id?: string
          variant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "variant_option_values_option_value_id_fkey"
            columns: ["option_value_id"]
            isOneToOne: false
            referencedRelation: "product_option_values"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "variant_option_values_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      collection_type: "manual" | "smart"
      gender_enum: "men" | "women" | "unisex"
      nav_link_type: "category" | "collection" | "url" | "dropdown_parent"
      product_status: "draft" | "active" | "archived"
      user_role: "admin" | "customer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      collection_type: ["manual", "smart"],
      gender_enum: ["men", "women", "unisex"],
      nav_link_type: ["category", "collection", "url", "dropdown_parent"],
      product_status: ["draft", "active", "archived"],
      user_role: ["admin", "customer"],
    },
  },
} as const
