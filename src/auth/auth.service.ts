import { supabase } from '@/shared/lib/supabase'
import type { Session, Profile, Negocio } from './auth.types'

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

  async cargarPerfil(): Promise<{ profile: Profile | null; negocio: Negocio | null }> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { profile: null, negocio: null }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle()

    if (error || !profile) return { profile: null, negocio: null }

    const { data: negocio } = await supabase
      .from('negocios')
      .select('*')
      .eq('id', profile.negocio_id)
      .single()

    return {
      profile: profile as Profile,
      negocio: negocio as Negocio | null,
    }
  },

  async crearNegocioYPerfil(nombre: string) {
    const { data: sessionData } = await supabase.auth.getSession()

    if (!sessionData.session) {
      throw new Error('Sesión no lista aún')
    }

    const user = sessionData.session.user

    // Crear negocio (user_id se asigna automático en DB)
    const { data: negocio, error: eNeg } = await supabase
      .from('negocios')
      .insert({ nombre })
      .select()
      .single()

    if (eNeg) throw new Error(eNeg.message)

    // Crear o actualizar profile
    const { data: profile, error: eProf } = await supabase
      .from('profiles')
      .upsert({
        user_id: user.id,
        negocio_id: negocio.id,
        email: user.email ?? null
      })
      .select()
      .single()

    if (eProf) throw new Error(eProf.message)

    return { profile, negocio }
  },

  async unirseConCodigo(codigo: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data: inv, error: eInv } = await supabase
      .from('invitaciones')
      .select('*')
      .eq('codigo', codigo.toUpperCase())
      .is('usado_por', null)
      .gt('expira_at', new Date().toISOString())
      .single()

    if (eInv || !inv) throw new Error('Código inválido o expirado')

    const { error: eProf } = await supabase
      .from('profiles')
      .insert({ user_id: user.id, negocio_id: inv.negocio_id, email: user.email ?? null })
    if (eProf) throw new Error(eProf.message)

    await supabase
      .from('invitaciones')
      .update({ usado_por: user.id, usado_at: new Date().toISOString() })
      .eq('id', inv.id)
  },
}
