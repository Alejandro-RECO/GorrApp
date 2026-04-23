import type { Session } from '@supabase/supabase-js'

export type { Session }

export interface AuthState {
  session: Session | null
  cargando: boolean
  loginConGoogle: () => Promise<void>
  cerrarSesion: () => Promise<void>
  inicializarSesion: () => Promise<void>
}
