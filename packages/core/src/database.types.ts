export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      admin_allowlist: {
        Row: {
          created_at: string;
          email: string;
          name: string | null;
        };
        Insert: {
          created_at?: string;
          email: string;
          name?: string | null;
        };
        Update: {
          created_at?: string;
          email?: string;
          name?: string | null;
        };
        Relationships: [];
      };
      anime: {
        Row: {
          aliases: string[];
          created_at: string;
          en_title: string | null;
          id: number;
          jp_title: string | null;
          kr_sub_title: string | null;
          kr_title: string;
          type: string;
          updated_at: string | null;
        };
        Insert: {
          aliases?: string[];
          created_at?: string;
          en_title?: string | null;
          id?: number;
          jp_title?: string | null;
          kr_sub_title?: string | null;
          kr_title: string;
          type?: string;
          updated_at?: string | null;
        };
        Update: {
          aliases?: string[];
          created_at?: string;
          en_title?: string | null;
          id?: number;
          jp_title?: string | null;
          kr_sub_title?: string | null;
          kr_title?: string;
          type?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      feedback: {
        Row: {
          admin_note: string | null;
          admin_reply: string | null;
          app_version: string | null;
          body: string | null;
          created_at: string;
          device_uuid: string;
          id: number;
          kind: string;
          media_id: number | null;
          media_name_raw: string | null;
          photo_url: string | null;
          status: string;
          title: string | null;
          updated_at: string;
        };
        Insert: {
          admin_note?: string | null;
          admin_reply?: string | null;
          app_version?: string | null;
          body?: string | null;
          created_at?: string;
          device_uuid: string;
          id?: number;
          kind: string;
          media_id?: number | null;
          media_name_raw?: string | null;
          photo_url?: string | null;
          status?: string;
          title?: string | null;
          updated_at?: string;
        };
        Update: {
          admin_note?: string | null;
          admin_reply?: string | null;
          app_version?: string | null;
          body?: string | null;
          created_at?: string;
          device_uuid?: string;
          id?: number;
          kind?: string;
          media_id?: number | null;
          media_name_raw?: string | null;
          photo_url?: string | null;
          status?: string;
          title?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "feedback_media_id_fkey";
            columns: ["media_id"];
            isOneToOne: false;
            referencedRelation: "anime";
            referencedColumns: ["id"];
          },
        ];
      };
      gacha: {
        Row: {
          anime_id: number | null;
          created_at: string | null;
          id: number;
          image_link: string | null;
          name: string | null;
          name_kr: string | null;
          price: number | null;
          release_month: string | null;
          updated_at: string | null;
        };
        Insert: {
          anime_id?: number | null;
          created_at?: string | null;
          id?: number;
          image_link?: string | null;
          name?: string | null;
          name_kr?: string | null;
          price?: number | null;
          release_month?: string | null;
          updated_at?: string | null;
        };
        Update: {
          anime_id?: number | null;
          created_at?: string | null;
          id?: number;
          image_link?: string | null;
          name?: string | null;
          name_kr?: string | null;
          price?: number | null;
          release_month?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "gacha_anime_id_fkey";
            columns: ["anime_id"];
            isOneToOne: false;
            referencedRelation: "anime";
            referencedColumns: ["id"];
          },
        ];
      };
      gacha_items: {
        Row: {
          created_at: string;
          gacha_id: number;
          id: number;
          image_link: string | null;
          name: string;
          name_kr: string | null;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          gacha_id: number;
          id?: number;
          image_link?: string | null;
          name: string;
          name_kr?: string | null;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          gacha_id?: number;
          id?: number;
          image_link?: string | null;
          name?: string;
          name_kr?: string | null;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "gacha_items_gacha_id_fkey";
            columns: ["gacha_id"];
            isOneToOne: false;
            referencedRelation: "gacha";
            referencedColumns: ["id"];
          },
        ];
      };
      gacha_view_log: {
        Row: {
          created_at: string;
          device_id: string;
          gacha_id: number;
          id: number;
          viewed_on: string;
        };
        Insert: {
          created_at?: string;
          device_id: string;
          gacha_id: number;
          id?: number;
          viewed_on?: string;
        };
        Update: {
          created_at?: string;
          device_id?: string;
          gacha_id?: number;
          id?: number;
          viewed_on?: string;
        };
        Relationships: [
          {
            foreignKeyName: "gacha_view_log_gacha_id_fkey";
            columns: ["gacha_id"];
            isOneToOne: false;
            referencedRelation: "gacha";
            referencedColumns: ["id"];
          },
        ];
      };
      notice: {
        Row: {
          body: string;
          created_at: string;
          id: number;
          is_fixed: boolean;
          is_published: boolean;
          published_at: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          body: string;
          created_at?: string;
          id?: number;
          is_fixed?: boolean;
          is_published?: boolean;
          published_at?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          id?: number;
          is_fixed?: boolean;
          is_published?: boolean;
          published_at?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      list_my_feedback: {
        Args: { p_device_uuid: string; p_limit?: number; p_offset?: number };
        Returns: {
          admin_reply: string;
          body: string;
          created_at: string;
          id: number;
          kind: string;
          media_id: number;
          media_name_raw: string;
          photo_url: string;
          status: string;
          title: string;
          updated_at: string;
        }[];
      };
      log_gacha_view: {
        Args: { p_device_id: string; p_gacha_id: number };
        Returns: undefined;
      };
      submit_feedback: {
        Args: {
          p_app_version?: string;
          p_body?: string;
          p_device_uuid: string;
          p_kind: string;
          p_media_id?: number;
          p_media_name_raw?: string;
          p_photo_url?: string;
          p_title?: string;
        };
        Returns: number;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
