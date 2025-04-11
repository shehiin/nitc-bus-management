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
      students: {
        Row: {
          id: string;
          created_at: string;
          email: string;
          name: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          email: string;
          name: string;
          user_id: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          email?: string;
          name?: string;
          user_id?: string;
        };
      };
      drivers: {
        Row: {
          id: string;
          created_at: string;
          email: string;
          name: string;
          driver_id: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          email: string;
          name: string;
          driver_id: string;
          user_id: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          email?: string;
          name?: string;
          driver_id?: string;
          user_id?: string;
        };
      };
      bookings: {
        Row: {
          id: string;
          created_at: string;
          student_id: string;
          location: string;
          date: string;
          time: string;
          status: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          student_id: string;
          location: string;
          date: string;
          time: string;
          status: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          student_id?: string;
          location?: string;
          date?: string;
          time?: string;
          status?: string;
        };
      };
      stops: {
        Row: {
          id: string;
          created_at: string;
          location: string;
          address: string;
          lat: number;
          lng: number;
          is_stop: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          location: string;
          address: string;
          lat: number;
          lng: number;
          is_stop?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          location?: string;
          address?: string;
          lat?: number;
          lng?: number;
          is_stop?: boolean;
        };
      };
      routes: {
        Row: {
          id: string;
          created_at: string;
          stop_id: string;
          arrival_time: string;
          students_count: number;
          route_order: number;
          date: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          stop_id: string;
          arrival_time: string;
          students_count: number;
          route_order: number;
          date: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          stop_id?: string;
          arrival_time?: string;
          students_count?: number;
          route_order?: number;
          date?: string;
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
