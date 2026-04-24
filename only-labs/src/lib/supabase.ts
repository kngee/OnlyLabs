import { createClient } from '@supabase/supabase-js';

// We must provide a valid URL format here even if it falls back to a dummy one,
// otherwise the Supabase client will crash the entire app and turn it into a blank white screen.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://abcdfghijk.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSJ9.xxxxx';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
