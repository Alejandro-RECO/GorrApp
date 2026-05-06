import { supabase } from '@/shared/lib/supabase'
import { getAuthContext } from '@/shared/lib/getNegocioId'
import type { CuotaConCliente, Abono, CrearAbono } from './cobros.types'
import { calcularSaldoPendiente } from './cobros.utils'

export const CobrosService = {
  async obtenerCuotasPendientes(): Promise<CuotaConCliente[]> {
    const { data, error } = await supabase
      .from('cuotas')
      .select('*, ventas(id, total, clientes(id, nombre, telefono))')
      .eq('estado', 'pendiente')
      .order('fecha_vencimiento', { ascending: true })

    if (error) throw new Error(error.message)
    return (data as CuotaConCliente[]) || []
  },

  async registrarAbono(params: CrearAbono): Promise<Abono> {
    const { userId, negocioId } = getAuthContext()

    // 1. Insert abono
    const { data: abonoInsertado, error: errorInsert } = await supabase
      .from('abonos')
      .insert({
        cuota_id: params.cuotaId,
        valor: params.valor,
        medio_pago: params.medioPago,
        notas: params.notas || null,
        user_id: userId,
        negocio_id: negocioId,
      })
      .select()
      .single()

    if (errorInsert) throw new Error(errorInsert.message)
    const abonoId = (abonoInsertado as Abono).id

    try {
      // 2. Verificar si cuota queda saldada
      const { data: cuotaActual, error: errorCuota } = await supabase
        .from('cuotas')
        .select('*, abonos(*)')
        .eq('id', params.cuotaId)
        .single()

      if (errorCuota) throw new Error(errorCuota.message)
      if (!cuotaActual) throw new Error('Cuota no encontrada')

      const saldo = calcularSaldoPendiente(cuotaActual, (cuotaActual.abonos || []) as Abono[])

      if (saldo <= 0) {
        const { error: errorUpdate } = await supabase
          .from('cuotas')
          .update({ estado: 'pagada' })
          .eq('id', params.cuotaId)
        if (errorUpdate) throw new Error(errorUpdate.message)
      }

      // 3. Registrar ingreso en caja
      const fecha = new Date().toISOString().split('T')[0]
      const { error: errorCaja } = await supabase
        .from('movimientos_caja')
        .insert({
          user_id: userId,
          negocio_id: negocioId,
          tipo: 'ingreso_abono',
          valor: params.valor,
          medio_pago: params.medioPago,
          fecha,
          descripcion: 'Cobro de cuota',
        })
        .select()
        .single()

      if (errorCaja) throw new Error(errorCaja.message)
    } catch (err) {
      // Rollback manual: eliminar abono si pasos siguientes fallan
      await supabase.from('abonos').delete().eq('id', abonoId)
      throw err
    }

    return abonoInsertado as Abono
  },

  async obtenerAbonosPorCuota(cuotaId: string): Promise<Abono[]> {
    const { data, error } = await supabase
      .from('abonos')
      .select('*')
      .eq('cuota_id', cuotaId)
      .order('created_at', { ascending: true })

    if (error) throw new Error(error.message)
    return (data as Abono[]) || []
  },
}
