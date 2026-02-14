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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      auth_verifications: {
        Row: {
          attempts: number
          created_at: string
          expires_at: string
          id: string
          identifier: string
          identifier_type: string
          is_verified: boolean
          max_attempts: number
          otp_code: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          expires_at: string
          id?: string
          identifier: string
          identifier_type: string
          is_verified?: boolean
          max_attempts?: number
          otp_code: string
        }
        Update: {
          attempts?: number
          created_at?: string
          expires_at?: string
          id?: string
          identifier?: string
          identifier_type?: string
          is_verified?: boolean
          max_attempts?: number
          otp_code?: string
        }
        Relationships: []
      }
      deals: {
        Row: {
          category: string
          created_at: string
          description: string | null
          discount_value: string
          id: string
          image_url: string | null
          is_active: boolean
          is_member_only: boolean
          min_points: number | null
          min_tier: Database["public"]["Enums"]["loyalty_tier"] | null
          title: string
          updated_at: string
          valid_from: string
          valid_until: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          discount_value: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_member_only?: boolean
          min_points?: number | null
          min_tier?: Database["public"]["Enums"]["loyalty_tier"] | null
          title: string
          updated_at?: string
          valid_from?: string
          valid_until: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          discount_value?: string
          id?: string
          image_url?: string | null
          is_active?: boolean
          is_member_only?: boolean
          min_points?: number | null
          min_tier?: Database["public"]["Enums"]["loyalty_tier"] | null
          title?: string
          updated_at?: string
          valid_from?: string
          valid_until?: string
        }
        Relationships: []
      }
      loyalty_accounts: {
        Row: {
          activated_at: string | null
          barcode_value: string
          created_at: string
          current_points: number
          current_tier: Database["public"]["Enums"]["loyalty_tier"]
          id: string
          is_active: boolean
          lifetime_points: number
          max_discount_unlocked: number
          member_id: string
          referred_by_staff_code: string | null
          tier_multiplier: number
          updated_at: string
          user_id: string
        }
        Insert: {
          activated_at?: string | null
          barcode_value: string
          created_at?: string
          current_points?: number
          current_tier?: Database["public"]["Enums"]["loyalty_tier"]
          id?: string
          is_active?: boolean
          lifetime_points?: number
          max_discount_unlocked?: number
          member_id: string
          referred_by_staff_code?: string | null
          tier_multiplier?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          activated_at?: string | null
          barcode_value?: string
          created_at?: string
          current_points?: number
          current_tier?: Database["public"]["Enums"]["loyalty_tier"]
          id?: string
          is_active?: boolean
          lifetime_points?: number
          max_discount_unlocked?: number
          member_id?: string
          referred_by_staff_code?: string | null
          tier_multiplier?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          email_enabled: boolean
          id: string
          points_notifications: boolean
          promo_notifications: boolean
          push_enabled: boolean
          sms_enabled: boolean
          tier_notifications: boolean
          updated_at: string
          user_id: string
          whatsapp_enabled: boolean
          whatsapp_opt_in_date: string | null
        }
        Insert: {
          created_at?: string
          email_enabled?: boolean
          id?: string
          points_notifications?: boolean
          promo_notifications?: boolean
          push_enabled?: boolean
          sms_enabled?: boolean
          tier_notifications?: boolean
          updated_at?: string
          user_id: string
          whatsapp_enabled?: boolean
          whatsapp_opt_in_date?: string | null
        }
        Update: {
          created_at?: string
          email_enabled?: boolean
          id?: string
          points_notifications?: boolean
          promo_notifications?: boolean
          push_enabled?: boolean
          sms_enabled?: boolean
          tier_notifications?: boolean
          updated_at?: string
          user_id?: string
          whatsapp_enabled?: boolean
          whatsapp_opt_in_date?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      points_ledger: {
        Row: {
          created_at: string
          description: string
          expires_at: string | null
          id: string
          loyalty_account_id: string
          points: number
          reference_id: string | null
          staff_code: string | null
          store_id: string | null
          transaction_type: string
        }
        Insert: {
          created_at?: string
          description: string
          expires_at?: string | null
          id?: string
          loyalty_account_id: string
          points: number
          reference_id?: string | null
          staff_code?: string | null
          store_id?: string | null
          transaction_type: string
        }
        Update: {
          created_at?: string
          description?: string
          expires_at?: string | null
          id?: string
          loyalty_account_id?: string
          points?: number
          reference_id?: string | null
          staff_code?: string | null
          store_id?: string | null
          transaction_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_ledger_loyalty_account_id_fkey"
            columns: ["loyalty_account_id"]
            isOneToOne: false
            referencedRelation: "loyalty_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birthday: string | null
          clothing_sizes: Json | null
          created_at: string
          email: string
          full_name: string
          gender_preference: string | null
          id: string
          id_number_hash: string | null
          phone: string | null
          phone_verified: boolean
          preferred_store_id: string | null
          style_interests: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          birthday?: string | null
          clothing_sizes?: Json | null
          created_at?: string
          email: string
          full_name: string
          gender_preference?: string | null
          id?: string
          id_number_hash?: string | null
          phone?: string | null
          phone_verified?: boolean
          preferred_store_id?: string | null
          style_interests?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          birthday?: string | null
          clothing_sizes?: Json | null
          created_at?: string
          email?: string
          full_name?: string
          gender_preference?: string | null
          id?: string
          id_number_hash?: string | null
          phone?: string | null
          phone_verified?: boolean
          preferred_store_id?: string | null
          style_interests?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          created_at: string
          discount_applied: number
          id: string
          items_summary: Json | null
          loyalty_account_id: string
          points_earned: number
          purchase_date: string
          receipt_reference: string
          staff_code: string | null
          store_id: string | null
          total_amount: number
        }
        Insert: {
          created_at?: string
          discount_applied?: number
          id?: string
          items_summary?: Json | null
          loyalty_account_id: string
          points_earned?: number
          purchase_date?: string
          receipt_reference: string
          staff_code?: string | null
          store_id?: string | null
          total_amount: number
        }
        Update: {
          created_at?: string
          discount_applied?: number
          id?: string
          items_summary?: Json | null
          loyalty_account_id?: string
          points_earned?: number
          purchase_date?: string
          receipt_reference?: string
          staff_code?: string | null
          store_id?: string | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "purchases_loyalty_account_id_fkey"
            columns: ["loyalty_account_id"]
            isOneToOne: false
            referencedRelation: "loyalty_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "purchases_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      redemptions: {
        Row: {
          created_at: string
          deal_id: string | null
          expires_at: string
          id: string
          loyalty_account_id: string
          points_spent: number
          redemption_code: string
          reward_id: string | null
          status: string
          used_at: string | null
          used_at_store_id: string | null
        }
        Insert: {
          created_at?: string
          deal_id?: string | null
          expires_at: string
          id?: string
          loyalty_account_id: string
          points_spent?: number
          redemption_code: string
          reward_id?: string | null
          status?: string
          used_at?: string | null
          used_at_store_id?: string | null
        }
        Update: {
          created_at?: string
          deal_id?: string | null
          expires_at?: string
          id?: string
          loyalty_account_id?: string
          points_spent?: number
          redemption_code?: string
          reward_id?: string | null
          status?: string
          used_at?: string | null
          used_at_store_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "redemptions_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redemptions_loyalty_account_id_fkey"
            columns: ["loyalty_account_id"]
            isOneToOne: false
            referencedRelation: "loyalty_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redemptions_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "rewards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "redemptions_used_at_store_id_fkey"
            columns: ["used_at_store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      rewards: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          min_tier: Database["public"]["Enums"]["loyalty_tier"] | null
          points_cost: number
          stock_quantity: number | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          min_tier?: Database["public"]["Enums"]["loyalty_tier"] | null
          points_cost: number
          stock_quantity?: number | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          min_tier?: Database["public"]["Enums"]["loyalty_tier"] | null
          points_cost?: number
          stock_quantity?: number | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      staff_referrals: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          staff_code: string
          staff_user_id: string
          store_id: string | null
          total_commission_earned: number
          total_sales_value: number
          total_signups: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          staff_code: string
          staff_user_id: string
          store_id?: string | null
          total_commission_earned?: number
          total_sales_value?: number
          total_signups?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          staff_code?: string
          staff_user_id?: string
          store_id?: string | null
          total_commission_earned?: number
          total_sales_value?: number
          total_signups?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "staff_referrals_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          address: string
          city: string
          created_at: string
          id: string
          is_active: boolean
          latitude: number | null
          longitude: number | null
          name: string
          opening_hours: Json | null
          phone: string | null
          postal_code: string | null
          province: string
          updated_at: string
        }
        Insert: {
          address: string
          city: string
          created_at?: string
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          name: string
          opening_hours?: Json | null
          phone?: string | null
          postal_code?: string | null
          province: string
          updated_at?: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          name?: string
          opening_hours?: Json | null
          phone?: string | null
          postal_code?: string | null
          province?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
      generate_barcode: { Args: never; Returns: string }
      generate_member_id: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "staff" | "customer"
      loyalty_tier: "silver" | "gold" | "platinum"
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
      app_role: ["admin", "staff", "customer"],
      loyalty_tier: ["silver", "gold", "platinum"],
    },
  },
} as const
