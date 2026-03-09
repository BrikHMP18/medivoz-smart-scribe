import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Supabase anon keys are public by design — security is enforced via RLS policies.
// Env vars take priority; fallback values support platforms like Lovable that build from repo.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://ncmgxsrlzbqyqkowomkr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jbWd4c3JsemJxeXFrb3dvbWtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2NTYzOTYsImV4cCI6MjA1OTIzMjM5Nn0.41DVlU27hCbBqJxFYqi-iaxZp7OxnwXaMJFYDhOkjIs";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
