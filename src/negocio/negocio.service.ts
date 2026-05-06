import { supabase } from '@/shared/lib/supabase'
import { getAuthContext } from '@/shared/lib/getNegocioId'
import type { Invitacion, Miembro } from './negocio.types'

function generarCodigo(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export const NegocioService = {
  async obtenerMiembros(): Promise<Miembro[]> {
    const { negocioId } = getAuthContext()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('negocio_id', negocioId)
      .order('created_at', { ascending: true })

    if (error) throw new Error(error.message)
    return (data || []) as Miembro[]
  },

  async generarCodigoInvitacion(): Promise<Invitacion> {
    const { userId, negocioId } = getAuthContext()
    const codigo = generarCodigo()
    const expira_at = new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString()

    const { data, error } = await supabase
      .from('invitaciones')
      .insert({ negocio_id: negocioId, codigo, creado_por: userId, expira_at })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as Invitacion
  },

  async obtenerInvitacionesActivas(): Promise<Invitacion[]> {
    const { negocioId } = getAuthContext()
    const { data, error } = await supabase
      .from('invitaciones')
      .select('*')
      .eq('negocio_id', negocioId)
      .is('usado_por', null)
      .gt('expira_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return (data || []) as Invitacion[]
  },

  async actualizarNombreNegocio(nombre: string): Promise<void> {
    const { negocioId } = getAuthContext()
    const { error } = await supabase
      .from('negocios')
      .update({ nombre })
      .eq('id', negocioId)

    if (error) throw new Error(error.message)
  },
}
