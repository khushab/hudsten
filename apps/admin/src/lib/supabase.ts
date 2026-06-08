import { createBrowserSupabaseClient, type HudstenClient } from "@hudsten/db";
import { getAdminEnv } from "./env";

// Single shared client instance for the SPA (persists the admin's session).
let _client: HudstenClient | null = null;

export function getSupabase(): HudstenClient {
  if (!_client) {
    const { supabaseUrl, supabaseAnonKey } = getAdminEnv();
    _client = createBrowserSupabaseClient(supabaseUrl, supabaseAnonKey);
  }
  return _client;
}
