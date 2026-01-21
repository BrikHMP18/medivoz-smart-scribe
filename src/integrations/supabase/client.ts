import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { logger } from '@/utils/logger';

// Use environment variables with fallback for development
// CRITICAL: For production, these MUST be set as environment variables
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://ncmgxsrlzbqyqkowomkr.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5jbWd4c3JsemJxeXFrb3dvbWtyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM2NTYzOTYsImV4cCI6MjA1OTIzMjM5Nn0.41DVlU27hCbBqJxFYqi-iaxZp7OxnwXaMJFYDhOkjIs";

// Validate required environment variables in production
if (import.meta.env.PROD && (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY)) {
  logger.error("Missing required environment variables: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY");
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});