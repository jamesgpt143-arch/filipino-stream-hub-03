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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      api_usage_log: {
        Row: {
          created_at: string
          date_bucket: string
          endpoint: string
          id: string
          ip_address: string | null
          request_count: number | null
          service: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          date_bucket?: string
          endpoint: string
          id?: string
          ip_address?: string | null
          request_count?: number | null
          service?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          date_bucket?: string
          endpoint?: string
          id?: string
          ip_address?: string | null
          request_count?: number | null
          service?: string
          user_id?: string | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          created_at: string
          facebook_link: string | null
          id: string
          message: string
          name: string
          reply_to: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          facebook_link?: string | null
          id?: string
          message: string
          name: string
          reply_to?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          facebook_link?: string | null
          id?: string
          message?: string
          name?: string
          reply_to?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_reply_to_fkey"
            columns: ["reply_to"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_channels: {
        Row: {
          category: string | null
          clear_key: Json | null
          created_at: string
          embed_url: string | null
          has_multiple_streams: boolean | null
          id: string
          logo: string
          manifest_uri: string
          name: string
          type: string
          updated_at: string
          user_id: string
          youtube_channel_id: string | null
        }
        Insert: {
          category?: string | null
          clear_key?: Json | null
          created_at?: string
          embed_url?: string | null
          has_multiple_streams?: boolean | null
          id?: string
          logo: string
          manifest_uri: string
          name: string
          type: string
          updated_at?: string
          user_id: string
          youtube_channel_id?: string | null
        }
        Update: {
          category?: string | null
          clear_key?: Json | null
          created_at?: string
          embed_url?: string | null
          has_multiple_streams?: boolean | null
          id?: string
          logo?: string
          manifest_uri?: string
          name?: string
          type?: string
          updated_at?: string
          user_id?: string
          youtube_channel_id?: string | null
        }
        Relationships: []
      }
      fallback_opm_videos: {
        Row: {
          category: string | null
          channel_title: string
          created_at: string
          duration: string | null
          id: string
          is_active: boolean | null
          thumbnail_url: string
          title: string
          video_id: string
        }
        Insert: {
          category?: string | null
          channel_title: string
          created_at?: string
          duration?: string | null
          id?: string
          is_active?: boolean | null
          thumbnail_url: string
          title: string
          video_id: string
        }
        Update: {
          category?: string | null
          channel_title?: string
          created_at?: string
          duration?: string | null
          id?: string
          is_active?: boolean | null
          thumbnail_url?: string
          title?: string
          video_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recently_watched: {
        Row: {
          content_id: number
          content_type: string
          duration: number | null
          id: string
          overview: string | null
          poster_path: string | null
          progress: number | null
          title: string
          user_id: string
          watched_at: string
        }
        Insert: {
          content_id: number
          content_type: string
          duration?: number | null
          id?: string
          overview?: string | null
          poster_path?: string | null
          progress?: number | null
          title: string
          user_id: string
          watched_at?: string
        }
        Update: {
          content_id?: number
          content_type?: string
          duration?: number | null
          id?: string
          overview?: string | null
          poster_path?: string | null
          progress?: number | null
          title?: string
          user_id?: string
          watched_at?: string
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
      visits: {
        Row: {
          id: string
          ip_address: string | null
          page_path: string | null
          user_agent: string | null
          visit_date: string
          visited_at: string
          visitor_id: string | null
        }
        Insert: {
          id?: string
          ip_address?: string | null
          page_path?: string | null
          user_agent?: string | null
          visit_date?: string
          visited_at?: string
          visitor_id?: string | null
        }
        Update: {
          id?: string
          ip_address?: string | null
          page_path?: string | null
          user_agent?: string | null
          visit_date?: string
          visited_at?: string
          visitor_id?: string | null
        }
        Relationships: []
      }
      watchlist: {
        Row: {
          added_at: string
          content_id: number
          content_type: string
          id: string
          overview: string | null
          poster_path: string | null
          title: string
          user_id: string
        }
        Insert: {
          added_at?: string
          content_id: number
          content_type: string
          id?: string
          overview?: string | null
          poster_path?: string | null
          title: string
          user_id: string
        }
        Update: {
          added_at?: string
          content_id?: number
          content_type?: string
          id?: string
          overview?: string | null
          poster_path?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      youtube_search_cache: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          query: string
          results: Json
        }
        Insert: {
          created_at?: string
          expires_at?: string
          id?: string
          query: string
          results: Json
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          query?: string
          results?: Json
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_or_moderator: {
        Args: { _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
