/**
 * Admin env. Vite exposes only VITE_*-prefixed vars to the bundle. ONLY the anon key
 * is here — the admin authenticates with the user's JWT and RLS authorizes. The
 * service-role key must never reach this bundle (PRD §7).
 */
export interface AdminEnv {
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export function getAdminEnv(): AdminEnv {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
    | string
    | undefined;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Copy .env.example to .env.local.",
    );
  }
  return { supabaseUrl, supabaseAnonKey };
}
