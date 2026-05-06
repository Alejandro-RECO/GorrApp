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

    // 1. Insertar venta
    const { data: venta, error } = await supabase
      .from('ventas')
      .insert({ ...datos, user_id: userId, negocio_id: negocioId })
      .select()
      .single()

    if (error) throw new Error(error.message)
    const ventaId = (venta as unknown as Venta).id

    if (datos.tipo === 'contado') {
      // 2. Registrar ingreso en caja — rollback venta si falla
      const fecha = new Date().toISOString().split('T')[0]
      try {
        const { error: errorCaja } = await supabase
          .from('movimientos_caja')
          .insert({
            user_id: userId,
            negocio_id: negocioId,
            tipo: 'ingreso_venta',
            valor: datos.total,
            medio_pago: datos.medio_pago,
            fecha,
            descripcion: 'Venta de contado',
          })
          .select()
          .single()

        if (errorCaja) throw new Error(errorCaja.message)
      } catch (err) {
        await supabase.from('ventas').delete().eq('id', ventaId)
        throw err
      }
    } else {
      // 2. Crear cuotas para venta fiada
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
            venta_id: ventaId,
            user_id: userId,
            negocio_id: negocioId,
          }))
        )

      if (errorCuotas) throw new Error(errorCuotas.message)
    }

    return venta as unknown as Venta
  },
}
