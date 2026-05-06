import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/shared/types/supabase.types"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

// Wrapper fetch con timeout de 10 segundos.
// Cuando el browser pausa fetches en segundo plano, el cliente Supabase
// puede quedar con _refreshingDeferred sin resolver. Cualquier request
// posterior espera esa Promise interna para siempre.
// El timeout aborta el fetch colgado → catch en el store resetea cargando.
const fetchConTimeout = (input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 10000)

  const signal = init.signal
    ? (() => {
        const merged = new AbortController()
        init.signal!.addEventListener('abort', () => merged.abort())
        controller.signal.addEventListener('abort', () => merged.abort())
        return merged.signal
      })()
    : controller.signal

  return fetch(input, { ...init, signal }).finally(() => clearTimeout(timer))
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Bypasa navigator.locks para evitar bloqueo cross-tab.
    lock: async (_name, _acquireTimeout, fn) => fn(),
  },
  global: {
    fetch: fetchConTimeout,
  },
})
