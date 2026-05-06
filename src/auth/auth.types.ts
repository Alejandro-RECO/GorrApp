import type { Session } from '@supabase/supabase-js'

export type { Session }

export interface Profile {
  id: string
  user_id: string
  negocio_id: string
  email: string | null
  created_at: string
}

export interface Negocio {
  id: string
  nombre: string
  created_at: string
}

export interface AuthState {
  session: Session | null
  profile: Profile | null
  negocio: Negocio | null
  cargando: boolean
  loginConGoogle: () => Promise<void>
  cerrarSesion: () => Promise<void>
  inicializarSesion: () => Promise<void>
  cargarPerfil: () => Promise<void>
}
