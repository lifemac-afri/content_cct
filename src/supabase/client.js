import { createClient } from "@supabase/supabase-js";

// Initialize Supabase
const supabaseClient = createClient(
  import.meta.env.VITE_PROJECT_URL,
  import.meta.env.VITE_ANON_KEY
);

export { supabaseClient };
