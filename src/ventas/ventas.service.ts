import { supabase } from '@/shared/lib/supabase'
import type { Venta, CrearVenta } from './ventas.types'
import { calcularCuotas } from './ventas.utils'

export const VentasService = {
  async crear(datos: CrearVenta): Promise<Venta> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data: venta, error: errorVenta } = await supabase
      .from('ventas')
      .insert({ ...datos, user_id: user.id })
      .select()
      .single()

    if (errorVenta) throw new Error(errorVenta.message)

    const ventaCreada = venta as Venta

    if (datos.tipo !== 'contado') {
      const cuotas = calcularCuotas({
        total: datos.total,
        tipo: datos.tipo,
        fechaVenta: new Date(ventaCreada.created_at),
      }).map(c => ({
        ...c,
        venta_id: ventaCreada.id,
        user_id: user.id,
      }))

      const { error: errorCuotas } = await supabase
        .from('cuotas')
        .insert(cuotas)

      if (errorCuotas) {
        // Compensating delete — best-effort
        await supabase.from('ventas').delete().eq('id', ventaCreada.id)
        throw new Error(`Error creando cuotas: ${errorCuotas.message}`)
      }
    }

    return ventaCreada
  },

  async obtenerTodos(): Promise<Venta[]> {
    const { data, error } = await supabase
      .from('ventas')
      .select('*, clientes(nombre)')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return (data ?? []) as Venta[]
  },

  async obtenerPorCliente(clienteId: string): Promise<Venta[]> {
    const { data, error } = await supabase
      .from('ventas')
      .select('*, clientes(nombre)')
      .eq('cliente_id', clienteId)
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return (data ?? []) as Venta[]
  },
}
