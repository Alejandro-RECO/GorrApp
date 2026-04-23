import { supabase } from '@/shared/lib/supabase'
import type { Session } from './auth.types'

export const AuthService = {
  async loginConGoogle(): Promise<void> {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    })
    if (error) throw new Error(error.message)
  },

  async cerrarSesion(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) throw new Error(error.message)
  },

  async obtenerSesionActiva(): Promise<Session | null> {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw new Error(error.message)
    return data.session
  },
}
