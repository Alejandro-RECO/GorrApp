import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/shared/types/supabase.types"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Bypasa navigator.locks que bloquea requests PostgREST al cambiar de
    // pestaña mientras Supabase renueva el JWT. Trade-off aceptable para
    // app de un solo operador sin concurrencia cross-tab crítica.
    lock: async (_name, _acquireTimeout, fn) => fn(),
  },
})
