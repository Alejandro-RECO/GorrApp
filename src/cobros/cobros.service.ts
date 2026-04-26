import { supabase } from '@/shared/lib/supabase'
import type { Cuota, CuotaConCliente, Abono, CrearAbono } from './cobros.types'
import { calcularSaldoPendiente } from './cobros.utils'

export const CobrosService = {
  async obtenerCuotasPendientes(): Promise<CuotaConCliente[]> {
    const { data, error } = await supabase
      .from('cuotas')
      .select('*, ventas(id, total, clientes(id, nombre, telefono))')
      .eq('estado', 'pendiente')
      .order('fecha_vencimiento', { ascending: true })

    if (error) throw new Error(error.message)
    return data || []
  },

  async registrarAbono(params: CrearAbono): Promise<Abono> {
    const { data: abonoInsertado, error: errorInsert } = await supabase
      .from('abonos')
      .insert({
        cuota_id: params.cuotaId,
        valor: params.valor,
        medio_pago: params.medioPago,
        notas: params.notas || null,
      })
      .select()
      .single()

    if (errorInsert) throw new Error(errorInsert.message)

    const { data: cuotaActual, error: errorCuota } = await supabase
      .from('cuotas')
      .select('*, abonos(*)')
      .eq('id', params.cuotaId)
      .single()

    if (errorCuota) throw new Error(errorCuota.message)

    const saldo = calcularSaldoPendiente(cuotaActual, cuotaActual.abonos || [])
    
    if (saldo <= 0) {
      await supabase
        .from('cuotas')
        .update({ estado: 'pagada' })
        .eq('id', params.cuotaId)
    }

    return abonoInsertado
  },

  async obtenerAbonosPorCuota(cuotaId: string): Promise<Abono[]> {
    const { data, error } = await supabase
      .from('abonos')
      .select('*')
      .eq('cuota_id', cuotaId)
      .order('created_at', { ascending: true })

    if (error) throw new Error(error.message)
    return data || []
  },
}