import { supabase } from '@/shared/lib/supabase'
import { getAuthContext } from '@/shared/lib/getNegocioId'
import type { Cliente, CrearCliente, ActualizarCliente, VentaConProductos } from './clientes.types'

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
    const { userId, negocioId } = getAuthContext()

    const { data, error } = await supabase
      .from('clientes')
      .insert({ ...datos, user_id: userId, negocio_id: negocioId })
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

  async obtenerVentasCliente(clienteId: string): Promise<VentaConProductos[]> {
    const { data, error } = await supabase
      .from('ventas')
      .select(`
        id, total, tipo, medio_pago, created_at, notas,
        ventas_productos(cantidad, productos(id, nombre, precio_venta)),
        cuotas(id, valor, estado, fecha_vencimiento)
      `)
      .eq('cliente_id', clienteId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return ((data || []) as any[]).map(v => ({
      id: v.id,
      total: v.total,
      tipo: v.tipo,
      medio_pago: v.medio_pago,
      created_at: v.created_at,
      notas: v.notas,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      productos: (v.ventas_productos || []).map((vp: any) => ({
        producto_id: vp.productos?.id ?? '',
        nombre: vp.productos?.nombre ?? 'Producto eliminado',
        cantidad: vp.cantidad,
        precio_venta: vp.productos?.precio_venta ?? 0,
      })),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      cuotas: (v.cuotas || []).map((c: any) => ({
        id: c.id,
        valor: c.valor,
        estado: c.estado,
        fecha_vencimiento: c.fecha_vencimiento,
      })),
    }))
  },
}
