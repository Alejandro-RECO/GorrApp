import { supabase } from '@/shared/lib/supabase'
import { getAuthContext } from '@/shared/lib/getNegocioId'
import type { Venta, CrearVenta, VentaConCliente } from './ventas.types'
import { calcularCuotas } from './ventas.utils'

export const VentasService = {
  async obtenerTodos(): Promise<VentaConCliente[]> {
    const { data, error } = await supabase
      .from('ventas')
      .select('*, clientes(id, nombre, telefono)')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data as unknown as VentaConCliente[]
  },

  async crear(datos: CrearVenta): Promise<Venta> {
    const { userId, negocioId } = getAuthContext()

    const { data: venta, error } = await supabase
      .from('ventas')
      .insert({ ...datos, user_id: userId, negocio_id: negocioId })
      .select()
      .single()

    if (error) throw new Error(error.message)

    if (datos.tipo !== 'contado') {
      const cuotas = calcularCuotas({
        total: datos.total,
        tipo: datos.tipo,
        fechaVenta: new Date(),
      })

      const { error: errorCuotas } = await supabase
        .from('cuotas')
        .insert(
          cuotas.map(c => ({
            numero_cuota: c.numero_cuota,
            valor: c.valor,
            fecha_vencimiento: c.fecha_vencimiento,
            estado: c.estado,
            venta_id: venta.id,
            user_id: userId,
            negocio_id: negocioId,
          }))
        )

      if (errorCuotas) throw new Error(errorCuotas.message)
    }

    return venta as unknown as Venta
  },
}
