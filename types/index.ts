// Database types (to be generated via supabase gen types)
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
          display_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      content: {
        Row: {
          id: string;
          type: "anime" | "movie" | "tv" | "book" | "game";
          anilist_id: number | null;
          tmdb_id: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: "anime" | "movie" | "tv" | "book" | "game";
          anilist_id?: number | null;
          tmdb_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: "anime" | "movie" | "tv" | "book" | "game";
          anilist_id?: number | null;
          tmdb_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_content: {
        Row: {
          id: string;
          user_id: string;
          content_id: string;
          status: "plan_to_watch" | "watching" | "completed" | "dropped" | "on_hold";
          progress: number;
          season_progress: number;
          rating: number | null;
          notes: string | null;
          start_date: string | null;
          finish_date: string | null;
          rewatch_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          content_id: string;
          status: "plan_to_watch" | "watching" | "completed" | "dropped" | "on_hold";
          progress?: number;
          season_progress?: number;
          rating?: number | null;
          notes?: string | null;
          start_date?: string | null;
          finish_date?: string | null;
          rewatch_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          content_id?: string;
          status?: "plan_to_watch" | "watching" | "completed" | "dropped" | "on_hold";
          progress?: number;
          season_progress?: number;
          rating?: number | null;
          notes?: string | null;
          start_date?: string | null;
          finish_date?: string | null;
          rewatch_count?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      lists: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          is_public: boolean;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          is_public?: boolean;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          is_public?: boolean;
          is_default?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      list_items: {
        Row: {
          id: string;
          list_id: string;
          content_id: string;
          position: number;
          notes: string | null;
          added_at: string;
        };
        Insert: {
          id?: string;
          list_id: string;
          content_id: string;
          position: number;
          notes?: string | null;
          added_at?: string;
        };
        Update: {
          id?: string;
          list_id?: string;
          content_id?: string;
          position?: number;
          notes?: string | null;
          added_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}

// Content types for AniList and TMDB
export interface AniListMedia {
  id: number;
  title: {
    romaji: string;
    english: string | null;
    native: string;
  };
  description: string;
  coverImage: {
    large: string;
  };
  episodes: number;
  genres: string[];
}

export interface TMDBMedia {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  vote_average: number;
  genre_ids: number[];
}
