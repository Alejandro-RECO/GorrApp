import { supabase } from '@/shared/lib/supabase'
import type { Cliente, CrearCliente, ActualizarCliente } from './clientes.types'

type SupabaseClienteRow = {
  id: string
  user_id: string
  nombre: string
  telefono: string
  notas: string | null
  created_at: string
  updated_at: string
  ventas?: {
    cuotas: {
      id: string
      valor: number
      estado: string
      fecha_vencimiento: string
    }[]
  }[]
}

function mapToCliente(row: SupabaseClienteRow): Cliente {
  const cuotas = (row.ventas ?? []).flatMap(v =>
    (v.cuotas ?? []).map(c => ({
      id: c.id,
      valor: c.valor,
      estado: c.estado as 'pendiente' | 'pagada' | 'vencida',
      fecha_vencimiento: c.fecha_vencimiento,
    }))
  )
  return {
    id: row.id,
    user_id: row.user_id,
    nombre: row.nombre,
    telefono: row.telefono,
    notas: row.notas,
    created_at: row.created_at,
    updated_at: row.updated_at,
    cuotas,
  }
}

export const ClientesService = {
  async obtenerTodos(): Promise<Cliente[]> {
    const { data, error } = await supabase
      .from('clientes')
      .select('*, ventas(cuotas(id, valor, estado, fecha_vencimiento))')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return (data as SupabaseClienteRow[]).map(mapToCliente)
  },

  async crear(datos: CrearCliente): Promise<Cliente> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data, error } = await supabase
      .from('clientes')
      .insert({ ...datos, user_id: user.id })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return { ...(data as SupabaseClienteRow), cuotas: [] }
  },

  async actualizar(id: string, datos: ActualizarCliente): Promise<Cliente> {
    const { data, error } = await supabase
      .from('clientes')
      .update(datos)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return { ...(data as SupabaseClienteRow), cuotas: [] }
  },

  async eliminar(id: string): Promise<void> {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
  },
}
