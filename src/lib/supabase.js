import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;

export const supabaseConfigError = !supabaseUrl || !supabaseKey
  ? "Missing Supabase environment variables. Add VITE_SUPABASE_URL and VITE_SUPABASE_KEY to a .env file."
  : null;

const missingConfigError = new Error(supabaseConfigError || "Supabase is not configured.");

const safeSupabase = {
  auth: {
    getUser: async () => ({ data: { user: null }, error: null }),
    signInWithPassword: async () => {
      throw missingConfigError;
    },
    signUp: async () => {
      throw missingConfigError;
    },
    signOut: async () => ({ error: null })
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        maybeSingle: async () => ({ data: null, error: null })
      })
    })
  })
};

export const supabase = supabaseConfigError
  ? safeSupabase
  : createClient(supabaseUrl, supabaseKey);