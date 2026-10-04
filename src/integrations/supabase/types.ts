export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15";
  };
  public: {
    Tables: {
      job_applications: {
        Row: {
          id: string;
          job_id: string;
          full_name: string;
          email: string;
          phone: string;
          location: string;
          linkedin_url: string | null;
          portfolio_url: string | null;
          cover_message: string;
          resume_url: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          job_id: string;
          full_name: string;
          email: string;
          phone: string;
          location: string;
          linkedin_url?: string | null;
          portfolio_url?: string | null;
          cover_message: string;
          resume_url: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          job_id?: string;
          full_name?: string;
          email?: string;
          phone?: string;
          location?: string;
          linkedin_url?: string | null;
          portfolio_url?: string | null;
          cover_message?: string;
          resume_url?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "job_applications_job_id_fkey";
            columns: ["job_id"];
            isOneToOne: false;
            referencedRelation: "jobs";
            referencedColumns: ["id"];
          },
        ];
      };
      jobs: {
        Row: {
          id: string;
          title: string;
          department: string;
          employment_type: string;
          location: string;
          experience_level: string;
          short_description: string;
          description: string;
          responsibilities: string;
          requirements: string;
          skills: string[];
          benefits: string;
          application_deadline: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          department: string;
          employment_type: string;
          location: string;
          experience_level: string;
          short_description: string;
          description: string;
          responsibilities?: string;
          requirements?: string;
          skills?: string[];
          benefits?: string;
          application_deadline?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          department?: string;
          employment_type?: string;
          location?: string;
          experience_level?: string;
          short_description?: string;
          description?: string;
          responsibilities?: string;
          requirements?: string;
          skills?: string[];
          benefits?: string;
          application_deadline?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      project_images: {
        Row: {
          id: string;
          project_id: string;
          image_url: string;
          storage_path: string;
          is_primary: boolean;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          image_url: string;
          storage_path: string;
          is_primary?: boolean;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          image_url?: string;
          storage_path?: string;
          is_primary?: boolean;
          display_order?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_images_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "portfolio_projects";
            referencedColumns: ["id"];
          },
        ];
      };
      client_projects: {
        Row: {
          client_user_id: string | null;
          contract_value_usd: number;
          created_at: string;
          currency: string;
          id: string;
          name: string;
          progress: number;
          start_date: string | null;
          status: string;
          summary: string | null;
          target_date: string | null;
          updated_at: string;
        };
        Insert: {
          client_user_id?: string | null;
          contract_value_usd?: number;
          created_at?: string;
          currency?: string;
          id?: string;
          name: string;
          progress?: number;
          start_date?: string | null;
          status?: string;
          summary?: string | null;
          target_date?: string | null;
          updated_at?: string;
        };
        Update: {
          client_user_id?: string | null;
          contract_value_usd?: number;
          created_at?: string;
          currency?: string;
          id?: string;
          name?: string;
          progress?: number;
          start_date?: string | null;
          status?: string;
          summary?: string | null;
          target_date?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      faqs: {
        Row: {
          answer: string;
          category: string;
          created_at: string;
          id: string;
          is_published: boolean;
          locale: string;
          question: string;
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          answer: string;
          category?: string;
          created_at?: string;
          id?: string;
          is_published?: boolean;
          locale?: string;
          question: string;
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          answer?: string;
          category?: string;
          created_at?: string;
          id?: string;
          is_published?: boolean;
          locale?: string;
          question?: string;
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      invoices: {
        Row: {
          amount: number;
          created_at: string;
          currency: string;
          description: string | null;
          due_at: string | null;
          id: string;
          issued_at: string;
          number: string;
          project_id: string;
          status: string;
          updated_at: string;
        };
        Insert: {
          amount?: number;
          created_at?: string;
          currency?: string;
          description?: string | null;
          due_at?: string | null;
          id?: string;
          issued_at?: string;
          number: string;
          project_id: string;
          status?: string;
          updated_at?: string;
        };
        Update: {
          amount?: number;
          created_at?: string;
          currency?: string;
          description?: string | null;
          due_at?: string | null;
          id?: string;
          issued_at?: string;
          number?: string;
          project_id?: string;
          status?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "invoices_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "client_projects";
            referencedColumns: ["id"];
          },
        ];
      };
      leads: {
        Row: {
          budget_range: string | null;
          company: string | null;
          created_at: string;
          currency: string;
          email: string;
          estimated_total: number | null;
          full_name: string;
          id: string;
          message: string | null;
          phone: string | null;
          project_type: string | null;
          selected_items: Json;
          source: string;
          status: string;
          timeline: string | null;
          updated_at: string;
        };
        Insert: {
          budget_range?: string | null;
          company?: string | null;
          created_at?: string;
          currency?: string;
          email: string;
          estimated_total?: number | null;
          full_name: string;
          id?: string;
          message?: string | null;
          phone?: string | null;
          project_type?: string | null;
          selected_items?: Json;
          source?: string;
          status?: string;
          timeline?: string | null;
          updated_at?: string;
        };
        Update: {
          budget_range?: string | null;
          company?: string | null;
          created_at?: string;
          currency?: string;
          email?: string;
          estimated_total?: number | null;
          full_name?: string;
          id?: string;
          message?: string | null;
          phone?: string | null;
          project_type?: string | null;
          selected_items?: Json;
          source?: string;
          status?: string;
          timeline?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      portfolio_projects: {
        Row: {
          category: string;
          client_name: string | null;
          created_at: string;
          description: string | null;
          duration: string | null;
          gallery_urls: string[];
          github_url: string | null;
          hero_image_url: string | null;
          id: string;
          is_featured: boolean;
          is_published: boolean;
          live_url: string | null;
          locale: string;
          name: string;
          problem: string | null;
          slug: string;
          solution: string | null;
          short_description: string;
          sort_order: number;
          status: string;
          tags: string[];
          technologies: string[];
          thumbnail_url: string | null;
          updated_at: string;
        };
        Insert: {
          category: string;
          client_name?: string | null;
          created_at?: string;
          description?: string | null;
          duration?: string | null;
          gallery_urls?: string[];
          github_url?: string | null;
          hero_image_url?: string | null;
          id?: string;
          is_featured?: boolean;
          is_published?: boolean;
          live_url?: string | null;
          locale?: string;
          name: string;
          problem?: string | null;
          slug: string;
          solution?: string | null;
          short_description?: string;
          sort_order?: number;
          status?: string;
          tags?: string[];
          technologies?: string[];
          thumbnail_url?: string | null;
          updated_at?: string;
        };
        Update: {
          category?: string;
          client_name?: string | null;
          created_at?: string;
          description?: string | null;
          duration?: string | null;
          gallery_urls?: string[];
          github_url?: string | null;
          hero_image_url?: string | null;
          id?: string;
          is_featured?: boolean;
          is_published?: boolean;
          live_url?: string | null;
          locale?: string;
          name?: string;
          problem?: string | null;
          slug?: string;
          solution?: string | null;
          short_description?: string;
          sort_order?: number;
          status?: string;
          tags?: string[];
          technologies?: string[];
          thumbnail_url?: string | null;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_images_project_id_fkey";
            columns: ["id"];
            isOneToOne: false;
            referencedRelation: "project_images";
            referencedColumns: ["project_id"];
          },
        ];
      };
      pricing_items: {
        Row: {
          base_price_usd: number;
          category: string;
          created_at: string;
          description: string | null;
          id: string;
          is_addon: boolean;
          is_published: boolean;
          locale: string;
          name: string;
          sort_order: number;
          unit: string;
          updated_at: string;
        };
        Insert: {
          base_price_usd?: number;
          category: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_addon?: boolean;
          is_published?: boolean;
          locale?: string;
          name: string;
          sort_order?: number;
          unit?: string;
          updated_at?: string;
        };
        Update: {
          base_price_usd?: number;
          category?: string;
          created_at?: string;
          description?: string | null;
          id?: string;
          is_addon?: boolean;
          is_published?: boolean;
          locale?: string;
          name?: string;
          sort_order?: number;
          unit?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      project_files: {
        Row: {
          created_at: string;
          file_type: string;
          id: string;
          label: string;
          project_id: string;
          size_kb: number | null;
          updated_at: string;
          uploaded_by: string | null;
          url: string;
        };
        Insert: {
          created_at?: string;
          file_type?: string;
          id?: string;
          label: string;
          project_id: string;
          size_kb?: number | null;
          updated_at?: string;
          uploaded_by?: string | null;
          url: string;
        };
        Update: {
          created_at?: string;
          file_type?: string;
          id?: string;
          label?: string;
          project_id?: string;
          size_kb?: number | null;
          updated_at?: string;
          uploaded_by?: string | null;
          url?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_files_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "client_projects";
            referencedColumns: ["id"];
          },
        ];
      };
      project_messages: {
        Row: {
          body: string;
          created_at: string;
          id: string;
          project_id: string;
          sender_id: string;
          sender_label: string;
          updated_at: string;
        };
        Insert: {
          body: string;
          created_at?: string;
          id?: string;
          project_id: string;
          sender_id: string;
          sender_label?: string;
          updated_at?: string;
        };
        Update: {
          body?: string;
          created_at?: string;
          id?: string;
          project_id?: string;
          sender_id?: string;
          sender_label?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_messages_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "client_projects";
            referencedColumns: ["id"];
          },
        ];
      };
      project_milestones: {
        Row: {
          created_at: string;
          details: string | null;
          due_date: string | null;
          id: string;
          project_id: string;
          sort_order: number;
          status: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          details?: string | null;
          due_date?: string | null;
          id?: string;
          project_id: string;
          sort_order?: number;
          status?: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          details?: string | null;
          due_date?: string | null;
          id?: string;
          project_id?: string;
          sort_order?: number;
          status?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "project_milestones_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "client_projects";
            referencedColumns: ["id"];
          },
        ];
      };
      services: {
        Row: {
          created_at: string;
          description: string | null;
          icon: string | null;
          id: string;
          is_published: boolean;
          locale: string;
          slug: string;
          sort_order: number;
          starting_price_usd: number | null;
          tagline: string | null;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          icon?: string | null;
          id?: string;
          is_published?: boolean;
          locale?: string;
          slug: string;
          sort_order?: number;
          starting_price_usd?: number | null;
          tagline?: string | null;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          icon?: string | null;
          id?: string;
          is_published?: boolean;
          locale?: string;
          slug?: string;
          sort_order?: number;
          starting_price_usd?: number | null;
          tagline?: string | null;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      site_settings: {
        Row: {
          created_at: string;
          id: string;
          last_rate_updated_at: string;
          updated_at: string;
          usd_to_pkr_rate: number;
        };
        Insert: {
          created_at?: string;
          id?: string;
          last_rate_updated_at?: string;
          updated_at?: string;
          usd_to_pkr_rate?: number;
        };
        Update: {
          created_at?: string;
          id?: string;
          last_rate_updated_at?: string;
          updated_at?: string;
          usd_to_pkr_rate?: number;
        };
        Relationships: [];
      };
      team_members: {
        Row: {
          bio: string | null;
          created_at: string;
          experience: string | null;
          full_name: string;
          github_url: string | null;
          id: string;
          is_published: boolean;
          linkedin_url: string | null;
          locale: string;
          photo_url: string | null;
          position: string;
          skills: string[];
          sort_order: number;
          updated_at: string;
        };
        Insert: {
          bio?: string | null;
          created_at?: string;
          experience?: string | null;
          full_name: string;
          github_url?: string | null;
          id?: string;
          is_published?: boolean;
          linkedin_url?: string | null;
          locale?: string;
          photo_url?: string | null;
          position: string;
          skills?: string[];
          sort_order?: number;
          updated_at?: string;
        };
        Update: {
          bio?: string | null;
          created_at?: string;
          experience?: string | null;
          full_name?: string;
          github_url?: string | null;
          id?: string;
          is_published?: boolean;
          linkedin_url?: string | null;
          locale?: string;
          photo_url?: string | null;
          position?: string;
          skills?: string[];
          sort_order?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      testimonials: {
        Row: {
          author_name: string;
          author_role: string | null;
          avatar_url: string | null;
          company: string | null;
          company_logo_url: string | null;
          created_at: string;
          id: string;
          is_featured: boolean;
          is_published: boolean;
          locale: string;
          quote: string;
          rating: number;
          sort_order: number;
          updated_at: string;
          video_url: string | null;
        };
        Insert: {
          author_name: string;
          author_role?: string | null;
          avatar_url?: string | null;
          company?: string | null;
          company_logo_url?: string | null;
          created_at?: string;
          id?: string;
          is_featured?: boolean;
          is_published?: boolean;
          locale?: string;
          quote: string;
          rating?: number;
          sort_order?: number;
          updated_at?: string;
          video_url?: string | null;
        };
        Update: {
          author_name?: string;
          author_role?: string | null;
          avatar_url?: string | null;
          company?: string | null;
          company_logo_url?: string | null;
          created_at?: string;
          id?: string;
          is_featured?: boolean;
          is_published?: boolean;
          locale?: string;
          quote?: string;
          rating?: number;
          sort_order?: number;
          updated_at?: string;
          video_url?: string | null;
        };
        Relationships: [];
      };
      user_roles: {
        Row: {
          created_at: string;
          id: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          role: Database["public"]["Enums"]["app_role"];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          role?: Database["public"]["Enums"]["app_role"];
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"];
          _user_id: string;
        };
        Returns: boolean;
      };
      owns_project: { Args: { _project_id: string }; Returns: boolean };
    };
    Enums: {
      app_role: "admin" | "editor" | "client";
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
  public: {
    Enums: {
      app_role: ["admin", "editor", "client"],
    },
  },
} as const;
