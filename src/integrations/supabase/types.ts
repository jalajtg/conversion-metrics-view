export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          clinic_id: string | null
          created_at: string
          id: string
          lead_id: string
          scheduled_at: string
          status: string
          type: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          id?: string
          lead_id: string
          scheduled_at: string
          status?: string
          type: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          id?: string
          lead_id?: string
          scheduled_at?: string
          status?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_time: string
          clinic_id: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          phone: string | null
          product_id: string | null
          user_id: string | null
        }
        Insert: {
          booking_time: string
          clinic_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          product_id?: string | null
          user_id?: string | null
        }
        Update: {
          booking_time?: string
          clinic_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          product_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "clinic_product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      clinic_monthly_payments: {
        Row: {
          amount: number
          clinic_id: string
          created_at: string
          id: string
          month: number
          updated_at: string
          year: number
        }
        Insert: {
          amount?: number
          clinic_id: string
          created_at?: string
          id?: string
          month: number
          updated_at?: string
          year: number
        }
        Update: {
          amount?: number
          clinic_id?: string
          created_at?: string
          id?: string
          month?: number
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      clinic_new: {
        Row: {
          address: string | null
          address_description: string | null
          available_time_slots: string | null
          base_id: string | null
          booking_calendar_id: string | null
          booking_link: string | null
          booking_workflow: string | null
          calendar_id: string | null
          clinic_email: string | null
          clinic_name: string | null
          clinicId: string | null
          created_time: string | null
          id: string
          operation_hours: string | null
          phone_number: string | null
          plan_price: string | null
          state: string | null
          table_id: string | null
          time_interval: string | null
          time_zone: string | null
          wellness_plan_prices: string | null
        }
        Insert: {
          address?: string | null
          address_description?: string | null
          available_time_slots?: string | null
          base_id?: string | null
          booking_calendar_id?: string | null
          booking_link?: string | null
          booking_workflow?: string | null
          calendar_id?: string | null
          clinic_email?: string | null
          clinic_name?: string | null
          clinicId?: string | null
          created_time?: string | null
          id?: string
          operation_hours?: string | null
          phone_number?: string | null
          plan_price?: string | null
          state?: string | null
          table_id?: string | null
          time_interval?: string | null
          time_zone?: string | null
          wellness_plan_prices?: string | null
        }
        Update: {
          address?: string | null
          address_description?: string | null
          available_time_slots?: string | null
          base_id?: string | null
          booking_calendar_id?: string | null
          booking_link?: string | null
          booking_workflow?: string | null
          calendar_id?: string | null
          clinic_email?: string | null
          clinic_name?: string | null
          clinicId?: string | null
          created_time?: string | null
          id?: string
          operation_hours?: string | null
          phone_number?: string | null
          plan_price?: string | null
          state?: string | null
          table_id?: string | null
          time_interval?: string | null
          time_zone?: string | null
          wellness_plan_prices?: string | null
        }
        Relationships: []
      }
      clinic_product_categories: {
        Row: {
          clinic_id: string
          created_at: string
          id: string
          month: number
          price: number
          product_category_id: string
          updated_at: string
        }
        Insert: {
          clinic_id: string
          created_at?: string
          id?: string
          month: number
          price: number
          product_category_id: string
          updated_at?: string
        }
        Update: {
          clinic_id?: string
          created_at?: string
          id?: string
          month?: number
          price?: number
          product_category_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clinic_product_categories_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clinic_product_categories_product_category_id_fkey"
            columns: ["product_category_id"]
            isOneToOne: false
            referencedRelation: "product_category"
            referencedColumns: ["id"]
          },
        ]
      }
      clinics: {
        Row: {
          address: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          owner_id: string
          phone: string | null
          total_paid: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          owner_id: string
          phone?: string | null
          total_paid?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          owner_id?: string
          phone?: string | null
          total_paid?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          clinic_id: string | null
          created_at: string
          id: string
          lead_id: string
          notes: string | null
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          id?: string
          lead_id: string
          notes?: string | null
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          id?: string
          lead_id?: string
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      costs: {
        Row: {
          amount: number
          clinic_id: string | null
          created_at: string
          description: string | null
          id: string
          product_id: string
        }
        Insert: {
          amount: number
          clinic_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          product_id: string
        }
        Update: {
          amount?: number
          clinic_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "costs_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "costs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      demo_requests: {
        Row: {
          company_name: string
          created_at: string
          email: string
          id: string
          name: string
          phone_number: string | null
          purpose_of_chatbot: string
        }
        Insert: {
          company_name: string
          created_at?: string
          email: string
          id?: string
          name: string
          phone_number?: string | null
          purpose_of_chatbot: string
        }
        Update: {
          company_name?: string
          created_at?: string
          email?: string
          id?: string
          name?: string
          phone_number?: string | null
          purpose_of_chatbot?: string
        }
        Relationships: []
      }
      email_queue: {
        Row: {
          clinic_name: string | null
          created_at: string | null
          email_type: string
          id: string
          password: string | null
          processed: boolean | null
          user_email: string
          user_id: string | null
          user_name: string | null
        }
        Insert: {
          clinic_name?: string | null
          created_at?: string | null
          email_type: string
          id?: string
          password?: string | null
          processed?: boolean | null
          user_email: string
          user_id?: string | null
          user_name?: string | null
        }
        Update: {
          clinic_name?: string | null
          created_at?: string | null
          email_type?: string
          id?: string
          password?: string | null
          processed?: boolean | null
          user_email?: string
          user_id?: string | null
          user_name?: string | null
        }
        Relationships: []
      }
      frequently_asked_questions: {
        Row: {
          asked_count: number
          clinic_id: string | null
          created_at: string
          id: string
          question: string
        }
        Insert: {
          asked_count?: number
          clinic_id?: string | null
          created_at?: string
          id?: string
          question: string
        }
        Update: {
          asked_count?: number
          clinic_id?: string | null
          created_at?: string
          id?: string
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "frequently_asked_questions_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          automation: string | null
          booked: boolean | null
          booking: string | null
          client_name: string | null
          clinic_id: string | null
          created_at: string
          email: string | null
          engaged: boolean | null
          id: string
          lead: boolean | null
          old_user_id: string | null
          phone: string | null
          product_id: string | null
        }
        Insert: {
          automation?: string | null
          booked?: boolean | null
          booking?: string | null
          client_name?: string | null
          clinic_id?: string | null
          created_at?: string
          email?: string | null
          engaged?: boolean | null
          id?: string
          lead?: boolean | null
          old_user_id?: string | null
          phone?: string | null
          product_id?: string | null
        }
        Update: {
          automation?: string | null
          booked?: boolean | null
          booking?: string | null
          client_name?: string | null
          clinic_id?: string | null
          created_at?: string
          email?: string | null
          engaged?: boolean | null
          id?: string
          lead?: boolean | null
          old_user_id?: string | null
          phone?: string | null
          product_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      product_category: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          clinic_id: string | null
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          clinic_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          clinic_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          generated_password: string | null
          id: string
          name: string | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          generated_password?: string | null
          id: string
          name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          generated_password?: string | null
          id?: string
          name?: string | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      sales: {
        Row: {
          amount: number
          clinic_id: string | null
          created_at: string
          id: string
          lead_id: string
          product_id: string
        }
        Insert: {
          amount: number
          clinic_id?: string | null
          created_at?: string
          id?: string
          lead_id: string
          product_id: string
        }
        Update: {
          amount?: number
          clinic_id?: string | null
          created_at?: string
          id?: string
          lead_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_clinic_id_fkey"
            columns: ["clinic_id"]
            isOneToOne: false
            referencedRelation: "clinics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_profile: {
        Args: { user_id: string; user_name: string; user_role: string }
        Returns: undefined
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      replicate_products_to_all_clinics: {
        Args: { source_clinic_id: string }
        Returns: {
          target_clinic_id: string
          clinic_name: string
          products_replicated: number
        }[]
      }
      replicate_products_to_clinic: {
        Args: { source_clinic_id: string; target_clinic_id: string }
        Returns: number
      }
      send_user_notification_email: {
        Args: {
          p_user_id: string
          p_email_type: string
          p_clinic_name?: string
          p_password?: string
        }
        Returns: undefined
      }
      update_profile: {
        Args: { user_id: string; user_name: string; user_role: string }
        Returns: undefined
      }
      user_owns_clinic: {
        Args: { clinic_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "super_admin" | "user"
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
  public: {
    Enums: {
      app_role: ["admin", "super_admin", "user"],
    },
  },
} as const
