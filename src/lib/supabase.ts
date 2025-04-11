import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL || "https://btfqinluumsxtswbaeyy.supabase.co",
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ0ZnFpbmx1dW1zeHRzd2JhZXl5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNjQ1MjQsImV4cCI6MjA1OTk0MDUyNH0.zz5VkVKPOYoqEHHhOagdJ62xx86BddGSu2VcFCsgJ6M",
);
