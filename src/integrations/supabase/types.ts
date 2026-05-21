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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          add_ons: string[] | null
          check_in: string
          check_out: string
          created_at: string
          family_name: string | null
          guest_email: string
          guest_name: string
          guest_phone: string | null
          id: string
          id_document: string | null
          num_guests: number
          opera_confirmation_number: string | null
          payment_intent_id: string | null
          payment_status: string
          room_id: string
          special_requests: string | null
          status: string
          stripe_checkout_session_id: string | null
          tenant_id: string
          total_price: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          add_ons?: string[] | null
          check_in: string
          check_out: string
          created_at?: string
          family_name?: string | null
          guest_email: string
          guest_name: string
          guest_phone?: string | null
          id?: string
          id_document?: string | null
          num_guests?: number
          opera_confirmation_number?: string | null
          payment_intent_id?: string | null
          payment_status?: string
          room_id: string
          special_requests?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          tenant_id: string
          total_price: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          add_ons?: string[] | null
          check_in?: string
          check_out?: string
          created_at?: string
          family_name?: string | null
          guest_email?: string
          guest_name?: string
          guest_phone?: string | null
          id?: string
          id_document?: string | null
          num_guests?: number
          opera_confirmation_number?: string | null
          payment_intent_id?: string | null
          payment_status?: string
          room_id?: string
          special_requests?: string | null
          status?: string
          stripe_checkout_session_id?: string | null
          tenant_id?: string
          total_price?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bookings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "public_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean
          message: string
          name: string
          subject: string | null
          tenant_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          name: string
          subject?: string | null
          tenant_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
          subject?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contact_messages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "public_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_messages_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      opera_sync_log: {
        Row: {
          action: string
          booking_id: string | null
          created_at: string
          error_message: string | null
          id: string
          request_payload: Json | null
          response_payload: Json | null
          status: string
          tenant_id: string
        }
        Insert: {
          action: string
          booking_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          request_payload?: Json | null
          response_payload?: Json | null
          status?: string
          tenant_id: string
        }
        Update: {
          action?: string
          booking_id?: string | null
          created_at?: string
          error_message?: string | null
          id?: string
          request_payload?: Json | null
          response_payload?: Json | null
          status?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "opera_sync_log_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opera_sync_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "public_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opera_sync_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_events: {
        Row: {
          booking_id: string | null
          created_at: string
          event_type: string
          id: string
          payload: Json
          stripe_event_id: string
          tenant_id: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          event_type: string
          id?: string
          payload?: Json
          stripe_event_id: string
          tenant_id: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          event_type?: string
          id?: string
          payload?: Json
          stripe_event_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_events_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "public_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          phone: string | null
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          role?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          phone?: string | null
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reservation_locks: {
        Row: {
          check_in: string
          check_out: string
          created_at: string
          expires_at: string
          id: string
          room_id: string
          session_id: string
          tenant_id: string
        }
        Insert: {
          check_in: string
          check_out: string
          created_at?: string
          expires_at?: string
          id?: string
          room_id: string
          session_id: string
          tenant_id: string
        }
        Update: {
          check_in?: string
          check_out?: string
          created_at?: string
          expires_at?: string
          id?: string
          room_id?: string
          session_id?: string
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservation_locks_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "rooms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservation_locks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "public_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reservation_locks_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      rooms: {
        Row: {
          amenities: string[] | null
          category: string
          created_at: string
          description: string | null
          group_discount_percent: number
          group_discount_threshold: number
          id: string
          images: string[] | null
          inventory_count: number
          is_available: boolean
          max_guests: number
          name: string
          price_per_night: number
          size: string
          slug: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          amenities?: string[] | null
          category: string
          created_at?: string
          description?: string | null
          group_discount_percent?: number
          group_discount_threshold?: number
          id?: string
          images?: string[] | null
          inventory_count?: number
          is_available?: boolean
          max_guests?: number
          name: string
          price_per_night: number
          size: string
          slug: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          amenities?: string[] | null
          category?: string
          created_at?: string
          description?: string | null
          group_discount_percent?: number
          group_discount_threshold?: number
          id?: string
          images?: string[] | null
          inventory_count?: number
          is_available?: boolean
          max_guests?: number
          name?: string
          price_per_night?: number
          size?: string
          slug?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "public_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rooms_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      stay_surveys: {
        Row: {
          booking_id: string | null
          cleanliness: number | null
          comfort: number | null
          comments: string | null
          created_at: string
          food: number | null
          guest_email: string
          guest_name: string | null
          id: string
          overall_rating: number
          photo_url: string | null
          service: number | null
          tenant_id: string
          would_recommend: boolean | null
        }
        Insert: {
          booking_id?: string | null
          cleanliness?: number | null
          comfort?: number | null
          comments?: string | null
          created_at?: string
          food?: number | null
          guest_email: string
          guest_name?: string | null
          id?: string
          overall_rating: number
          photo_url?: string | null
          service?: number | null
          tenant_id: string
          would_recommend?: boolean | null
        }
        Update: {
          booking_id?: string | null
          cleanliness?: number | null
          comfort?: number | null
          comments?: string | null
          created_at?: string
          food?: number | null
          guest_email?: string
          guest_name?: string | null
          id?: string
          overall_rating?: number
          photo_url?: string | null
          service?: number | null
          tenant_id?: string
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "stay_surveys_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "public_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stay_surveys_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      tenant_members: {
        Row: {
          created_at: string
          id: string
          role: string
          tenant_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          tenant_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          tenant_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_members_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "public_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_members_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          accent_color: string | null
          address: string | null
          allow_cross_recommendations: boolean
          allowed_origins: string[] | null
          concierge_name: string | null
          concierge_persona: string | null
          contact_email: string | null
          created_at: string
          default_currency: string | null
          description: string | null
          driver_rate_per_km: number | null
          faq: string | null
          font_body: string | null
          font_display: string | null
          id: string
          images: string[]
          is_active: boolean
          location_lat: number | null
          location_lng: number | null
          logo_url: string | null
          name: string
          phone: string | null
          primary_color: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          address?: string | null
          allow_cross_recommendations?: boolean
          allowed_origins?: string[] | null
          concierge_name?: string | null
          concierge_persona?: string | null
          contact_email?: string | null
          created_at?: string
          default_currency?: string | null
          description?: string | null
          driver_rate_per_km?: number | null
          faq?: string | null
          font_body?: string | null
          font_display?: string | null
          id?: string
          images?: string[]
          is_active?: boolean
          location_lat?: number | null
          location_lng?: number | null
          logo_url?: string | null
          name: string
          phone?: string | null
          primary_color?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          address?: string | null
          allow_cross_recommendations?: boolean
          allowed_origins?: string[] | null
          concierge_name?: string | null
          concierge_persona?: string | null
          contact_email?: string | null
          created_at?: string
          default_currency?: string | null
          description?: string | null
          driver_rate_per_km?: number | null
          faq?: string | null
          font_body?: string | null
          font_display?: string | null
          id?: string
          images?: string[]
          is_active?: boolean
          location_lat?: number | null
          location_lng?: number | null
          logo_url?: string | null
          name?: string
          phone?: string | null
          primary_color?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      transport_bookings: {
        Row: {
          booking_id: string | null
          created_at: string
          distance_km: number
          estimated_fee_dh: number
          flight_or_train_no: string | null
          guest_email: string
          guest_name: string
          guest_phone: string | null
          id: string
          notes: string | null
          passengers: number
          pickup_address: string
          pickup_datetime: string
          pickup_lat: number | null
          pickup_lng: number | null
          status: string
          tenant_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          distance_km?: number
          estimated_fee_dh?: number
          flight_or_train_no?: string | null
          guest_email: string
          guest_name: string
          guest_phone?: string | null
          id?: string
          notes?: string | null
          passengers?: number
          pickup_address: string
          pickup_datetime: string
          pickup_lat?: number | null
          pickup_lng?: number | null
          status?: string
          tenant_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          distance_km?: number
          estimated_fee_dh?: number
          flight_or_train_no?: string | null
          guest_email?: string
          guest_name?: string
          guest_phone?: string | null
          id?: string
          notes?: string | null
          passengers?: number
          pickup_address?: string
          pickup_datetime?: string
          pickup_lat?: number | null
          pickup_lng?: number | null
          status?: string
          tenant_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transport_bookings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "public_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transport_bookings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_stay_surveys: {
        Row: {
          cleanliness: number | null
          comfort: number | null
          comments: string | null
          created_at: string | null
          food: number | null
          guest_name: string | null
          id: string | null
          overall_rating: number | null
          photo_url: string | null
          service: number | null
          tenant_id: string | null
          would_recommend: boolean | null
        }
        Insert: {
          cleanliness?: number | null
          comfort?: number | null
          comments?: string | null
          created_at?: string | null
          food?: number | null
          guest_name?: string | null
          id?: string | null
          overall_rating?: number | null
          photo_url?: string | null
          service?: number | null
          tenant_id?: string | null
          would_recommend?: boolean | null
        }
        Update: {
          cleanliness?: number | null
          comfort?: number | null
          comments?: string | null
          created_at?: string | null
          food?: number | null
          guest_name?: string | null
          id?: string | null
          overall_rating?: number | null
          photo_url?: string | null
          service?: number | null
          tenant_id?: string | null
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "stay_surveys_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "public_tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stay_surveys_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      public_tenants: {
        Row: {
          accent_color: string | null
          address: string | null
          allow_cross_recommendations: boolean | null
          concierge_name: string | null
          contact_email: string | null
          default_currency: string | null
          description: string | null
          font_body: string | null
          font_display: string | null
          id: string | null
          images: string[] | null
          is_active: boolean | null
          location_lat: number | null
          location_lng: number | null
          logo_url: string | null
          name: string | null
          phone: string | null
          primary_color: string | null
          slug: string | null
        }
        Insert: {
          accent_color?: string | null
          address?: string | null
          allow_cross_recommendations?: boolean | null
          concierge_name?: string | null
          contact_email?: string | null
          default_currency?: string | null
          description?: string | null
          font_body?: string | null
          font_display?: string | null
          id?: string | null
          images?: string[] | null
          is_active?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          logo_url?: string | null
          name?: string | null
          phone?: string | null
          primary_color?: string | null
          slug?: string | null
        }
        Update: {
          accent_color?: string | null
          address?: string | null
          allow_cross_recommendations?: boolean | null
          concierge_name?: string | null
          contact_email?: string | null
          default_currency?: string | null
          description?: string | null
          font_body?: string | null
          font_display?: string | null
          id?: string | null
          images?: string[] | null
          is_active?: boolean | null
          location_lat?: number | null
          location_lng?: number | null
          logo_url?: string | null
          name?: string | null
          phone?: string | null
          primary_color?: string | null
          slug?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_availability: {
        Args: { _check_in: string; _check_out: string; _room_id: string }
        Returns: boolean
      }
      check_room_inventory: {
        Args: { _check_in: string; _check_out: string; _room_id: string }
        Returns: number
      }
      cleanup_expired_locks: { Args: never; Returns: undefined }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_room_unavailable_ranges: {
        Args: { _room_id: string }
        Returns: {
          check_in: string
          check_out: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_super_admin: { Args: { _user_id: string }; Returns: boolean }
      is_tenant_admin: {
        Args: { _tenant_id: string; _user_id: string }
        Returns: boolean
      }
      is_tenant_member: {
        Args: { _tenant_id: string; _user_id: string }
        Returns: boolean
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "receptionist" | "manager" | "editor" | "super_admin"
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
      app_role: ["admin", "receptionist", "manager", "editor", "super_admin"],
    },
  },
} as const
