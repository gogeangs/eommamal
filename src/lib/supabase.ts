// Supabase connection. Without VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY the app runs on this device only
// (no accounts, no sync) — exactly as before. Both values are public by design; row level security protects data.
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null =
  url && key ? createClient(url, key, { auth: { persistSession: true, storageKey: 'emb-auth', detectSessionInUrl: false } }) : null;

export const serverReady = () => !!supabase;
