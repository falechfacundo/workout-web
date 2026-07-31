// This file provides a minimal type interface for Supabase.
// Run `npx supabase gen types typescript` to generate a full version.
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          user_id: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          preferred_unit: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      muscle_groups: {
        Row: {
          id: string;
          name: string;
          is_default: boolean;
          user_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["muscle_groups"]["Row"]> & {
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["muscle_groups"]["Row"]>;
      };
      exercises: {
        Row: {
          id: string;
          user_id: string | null;
          name: string;
          description: string | null;
          instructions: string | null;
          video_url: string | null;
          equipment_needed: string | null;
          difficulty_level: string | null;
          primary_muscle_group_id: string | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["exercises"]["Row"]> & {
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["exercises"]["Row"]>;
      };
      exercise_muscle_groups: {
        Row: {
          id: string;
          exercise_id: string;
          muscle_group_id: string;
          is_primary: boolean;
          incidence_level: number;
        };
        Insert: Partial<Database["public"]["Tables"]["exercise_muscle_groups"]["Row"]> & {
          exercise_id: string;
          muscle_group_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["exercise_muscle_groups"]["Row"]>;
      };
      mesocycles: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          start_date: string;
          end_date: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["mesocycles"]["Row"]> & {
          user_id: string;
          name: string;
          start_date: string;
          end_date: string;
        };
        Update: Partial<Database["public"]["Tables"]["mesocycles"]["Row"]>;
      };
      mesocycle_goals: {
        Row: {
          id: string;
          mesocycle_id: string;
          goal_type: string;
          target_value: number | null;
          unit: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["mesocycle_goals"]["Row"]> & {
          mesocycle_id: string;
          goal_type: string;
        };
        Update: Partial<Database["public"]["Tables"]["mesocycle_goals"]["Row"]>;
      };
      mesocycle_muscle_group_focus: {
        Row: {
          id: string;
          mesocycle_id: string;
          muscle_group_id: string;
          priority: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["mesocycle_muscle_group_focus"]["Row"]> & {
          mesocycle_id: string;
          muscle_group_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["mesocycle_muscle_group_focus"]["Row"]>;
      };
      training_sessions: {
        Row: {
          id: string;
          mesocycle_id: string;
          name: string;
          description: string | null;
          day_of_week: number | null;
          duration_minutes: number | null;
          status: string;
          scheduled_date: string | null;
          completed_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["training_sessions"]["Row"]> & {
          mesocycle_id: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["training_sessions"]["Row"]>;
      };
      session_exercises: {
        Row: {
          id: string;
          training_session_id: string;
          exercise_id: string;
          order_index: number;
          sets: number;
          reps: number;
          rir: number | null;
          rest_between_sets: number | null;
          rest_after_exercise: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["session_exercises"]["Row"]> & {
          training_session_id: string;
          exercise_id: string;
          sets: number;
          reps: number;
        };
        Update: Partial<Database["public"]["Tables"]["session_exercises"]["Row"]>;
      };
      workout_logs: {
        Row: {
          id: string;
          user_id: string;
          mesocycle_id: string | null;
          training_session_id: string | null;
          date: string;
          start_time: string | null;
          end_time: string | null;
          duration_minutes: number | null;
          notes: string | null;
          rating: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["workout_logs"]["Row"]> & {
          user_id: string;
          date: string;
        };
        Update: Partial<Database["public"]["Tables"]["workout_logs"]["Row"]>;
      };
      exercise_logs: {
        Row: {
          id: string;
          workout_log_id: string;
          exercise_id: string;
          set_number: number;
          reps: number;
          weight: number | null;
          rir: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["exercise_logs"]["Row"]> & {
          workout_log_id: string;
          exercise_id: string;
          set_number: number;
          reps: number;
        };
        Update: Partial<Database["public"]["Tables"]["exercise_logs"]["Row"]>;
      };
      measurements: {
        Row: {
          id: string;
          user_id: string;
          measurement_type: string;
          value: number;
          unit: string;
          measured_at: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["measurements"]["Row"]> & {
          user_id: string;
          measurement_type: string;
          value: number;
        };
        Update: Partial<Database["public"]["Tables"]["measurements"]["Row"]>;
      };
      workout_reminders: {
        Row: {
          id: string;
          user_id: string;
          training_session_id: string | null;
          day_of_week: number | null;
          time_of_day: string | null;
          is_enabled: boolean;
          notification_type: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["workout_reminders"]["Row"]> & {
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["workout_reminders"]["Row"]>;
      };
    };
    Functions: {
      get_volume_by_muscle_group: {
        Args: {
          user_id_param: string;
          period_param: string;
        };
        Returns: { id: string; name: string; volume: number; sets: number }[];
      };
    };
  };
}
