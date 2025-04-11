import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";

// Create a single supabase client for interacting with your database
export const supabase = createClient<Database>(
  import.meta.env.VITE_SUPABASE_URL || "https://example.supabase.co",
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhtdWZtbXFtYWJpaXdtcnlwZWJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE2OTg2MDM0NzcsImV4cCI6MjAxNDE3OTQ3N30.demo-key",
);
