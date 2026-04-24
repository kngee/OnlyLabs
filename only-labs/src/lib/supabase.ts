import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://sovdepmgggeexmbfuata.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvdmRlcG1nZ2dlZXhtYmZ1YXRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NDg5NDYsImV4cCI6MjA5MTMyNDk0Nn0.qCHF8qkw2N0e-eraIwirW8VsU9g8_vR778qzZt9gUvw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);