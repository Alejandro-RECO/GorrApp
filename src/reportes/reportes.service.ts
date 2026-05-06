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

    const { data: comprasData, error: eCompras } = await supabase
      .from('compras_inventario')
      .select('total')
      .order('created_at', { ascending: false })
    if (eCompras) throw new Error(eCompras.message)

    const ventas = (ventasData || []) as Venta[]
    const cuotas = (cuotasData || []) as Cuota[]
    const movimientos = (movimientosData || []) as MovimientoCaja[]
    const totalCompras = ((comprasData || []) as { total: number }[])
      .reduce((sum, c) => sum + c.total, 0)

    const totalVendido = calcularTotalVendido(ventas)
    const totalCartera = calcularTotalCartera(cuotas)

    const calcSaldo = (medio: 'efectivo' | 'digital') =>
      movimientos
        .filter(m => m.medio_pago === medio)
        .reduce((sum, m) => {
          const esIngreso = m.tipo === 'ingreso_venta' || m.tipo === 'ingreso_abono'
          return sum + (esIngreso ? m.valor : -m.valor)
        }, 0)

    const ventaIdsConMora = new Set(
      cuotas.filter(c => c.estado === 'vencida').map(c => c.venta_id)
    )
    const clienteIdsEnMora = new Set(
      ventas.filter(v => ventaIdsConMora.has(v.id)).map(v => v.cliente_id)
    )

    return {
      totalVendido,
      totalCartera,
      totalEfectivo: calcSaldo('efectivo'),
      totalDigital: calcSaldo('digital'),
      rentabilidad: totalVendido - totalCompras,
      clientesEnMora: clienteIdsEnMora.size,
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
    const selectStr = '*, ventas(id, total, clientes(id, nombre, telefono))'

    const { data: pendientes, error: ePend } = await supabase
      .from('cuotas')
      .select(selectStr)
      .eq('estado', 'pendiente')
      .order('fecha_vencimiento', { ascending: true })
    if (ePend) throw new Error(ePend.message)

    const { data: vencidas, error: eVenc } = await supabase
      .from('cuotas')
      .select(selectStr)
      .eq('estado', 'vencida')
      .order('fecha_vencimiento', { ascending: true })
    if (eVenc) throw new Error(eVenc.message)

    return [...(pendientes || []), ...(vencidas || [])] as CuotaConCliente[]
  },
}
