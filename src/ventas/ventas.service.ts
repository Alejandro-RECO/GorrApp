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

    // Omitir 'productos' del insert — no existe en la tabla ventas
    const { productos, ...datosVenta } = datos

    // 1. Insertar venta
    const { data: venta, error } = await supabase
      .from('ventas')
      .insert({ ...datosVenta, user_id: userId, negocio_id: negocioId })
      .select()
      .single()

    if (error) throw new Error(error.message)
    const ventaId = (venta as unknown as Venta).id

    try {
      if (datos.tipo === 'contado') {
        // 2a. Registrar ingreso en caja
        const fecha = new Date().toISOString().split('T')[0]
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
      } else {
        // 2b. Crear cuotas para venta fiada
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

      // 3. Registrar productos vendidos y descontar stock
      if (productos?.length) {
        for (const { producto_id, cantidad } of productos) {
          // Insert línea de venta
          const { error: eLinea } = await supabase
            .from('ventas_productos')
            .insert({ venta_id: ventaId, producto_id, cantidad, user_id: userId, negocio_id: negocioId })
          if (eLinea) throw new Error(eLinea.message)

          // Leer stock actual
          const { data: prod, error: eLeer } = await supabase
            .from('productos')
            .select('stock_actual')
            .eq('id', producto_id)
            .single()
          if (eLeer) throw new Error(eLeer.message)

          // Descontar — no baja de 0
          const nuevoStock = Math.max(0, ((prod as { stock_actual: number } | null)?.stock_actual ?? 0) - cantidad)
          const { error: eUpdate } = await supabase
            .from('productos')
            .update({ stock_actual: nuevoStock })
            .eq('id', producto_id)
          if (eUpdate) throw new Error(eUpdate.message)
        }
      }
    } catch (err) {
      // Rollback manual: eliminar venta si cualquier paso posterior falla
      await supabase.from('ventas').delete().eq('id', ventaId)
      throw err
    }

    return venta as unknown as Venta
  },
}
