import { supabase } from '@/shared/lib/supabase'
import type { Venta } from '@/ventas'
import type { Cuota, CuotaConCliente } from '@/cobros'
import type { MovimientoCaja } from '@/caja'
import type { ResumenGeneral } from './reportes.types'
import { calcularTotalVendido, calcularTotalCartera } from './reportes.utils'

export const ReportesService = {
  async obtenerResumenGeneral(): Promise<ResumenGeneral> {
    const { data: ventasData, error: eVentas } = await supabase
      .from('ventas')
      .select('*')
      .order('created_at', { ascending: false })
    if (eVentas) throw new Error(eVentas.message)

    const { data: cuotasData, error: eCuotas } = await supabase
      .from('cuotas')
      .select('*')
      .order('fecha_vencimiento', { ascending: true })
    if (eCuotas) throw new Error(eCuotas.message)

    const { data: movimientosData, error: eMov } = await supabase
      .from('movimientos_caja')
      .select('*')
      .order('created_at', { ascending: false })
    if (eMov) throw new Error(eMov.message)

    const ventas = (ventasData || []) as Venta[]
    const cuotas = (cuotasData || []) as Cuota[]
    const movimientos = (movimientosData || []) as MovimientoCaja[]

    const totalVendido = calcularTotalVendido(ventas)
    const totalCartera = calcularTotalCartera(cuotas)

    const calcSaldo = (medio: 'efectivo' | 'digital') =>
      movimientos
        .filter(m => m.medio_pago === medio)
        .reduce((sum, m) => {
          const esIngreso = m.tipo === 'ingreso_venta' || m.tipo === 'ingreso_abono'
          return sum + (esIngreso ? m.valor : -m.valor)
        }, 0)

    return {
      totalVendido,
      totalCartera,
      totalEfectivo: calcSaldo('efectivo'),
      totalDigital: calcSaldo('digital'),
      rentabilidad: totalVendido,
      clientesEnMora: 0,
    }
  },

  async obtenerVentasPeriodo(desde: string, hasta: string): Promise<Venta[]> {
    const { data, error } = await supabase
      .from('ventas')
      .select('*')
      .gte('created_at', desde)
      .lte('created_at', hasta)

    if (error) throw new Error(error.message)
    return (data || []) as Venta[]
  },

  async obtenerCarteraPendiente(): Promise<CuotaConCliente[]> {
    const { data, error } = await supabase
      .from('cuotas')
      .select('*, ventas(id, total, clientes(id, nombre, telefono))')
      .eq('estado', 'pendiente')
      .order('fecha_vencimiento', { ascending: true })

    if (error) throw new Error(error.message)
    return (data || []) as CuotaConCliente[]
  },
}
