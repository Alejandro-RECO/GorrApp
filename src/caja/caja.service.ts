import { supabase } from '@/shared/lib/supabase'
import type { MovimientoCaja, CrearMovimiento } from './caja.types'

export const CajaService = {
  async obtenerMovimientosDia(fecha: string): Promise<MovimientoCaja[]> {
    const { data, error } = await supabase
      .from('movimientos_caja')
      .select('*')
      .eq('fecha', fecha)
      .order('created_at', { ascending: true })

    if (error) throw new Error(error.message)
    return data || []
  },

  async registrarMovimiento(datos: CrearMovimiento): Promise<MovimientoCaja> {
    const { data, error } = await supabase
      .from('movimientos_caja')
      .insert({
        tipo: datos.tipo,
        valor: datos.valor,
        medio_pago: datos.medioPago,
        fecha: datos.fecha,
        descripcion: datos.descripcion ?? '',
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  async obtenerResumenPeriodo(desde: string, hasta: string): Promise<MovimientoCaja[]> {
    const { data, error } = await supabase
      .from('movimientos_caja')
      .select('*')
      .gte('fecha', desde)
      .lte('fecha', hasta)

    if (error) throw new Error(error.message)
    return data || []
  },
}
