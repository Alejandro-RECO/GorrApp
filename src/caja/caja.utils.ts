import type { MovimientoCaja, MedioPago, TipoMovimiento } from './caja.types'

const TIPOS_INGRESO: TipoMovimiento[] = ['ingreso_venta', 'ingreso_abono']

export function esIngreso(tipo: TipoMovimiento | string): boolean {
  return TIPOS_INGRESO.includes(tipo as TipoMovimiento)
}

export function calcularSaldoDia(movimientos: MovimientoCaja[]): number {
  return movimientos.reduce((sum, m) => {
    return esIngreso(m.tipo) ? sum + m.valor : sum - m.valor
  }, 0)
}

export function calcularSaldoPorMedio(movimientos: MovimientoCaja[], medio: MedioPago): number {
  return calcularSaldoDia(movimientos.filter(m => m.medio_pago === medio))
}

export function agruparPorTipo(movimientos: MovimientoCaja[]): Record<TipoMovimiento, number> {
  const base: Record<TipoMovimiento, number> = {
    ingreso_venta: 0,
    ingreso_abono: 0,
    gasto_operativo: 0,
    gasto_inversion: 0,
    compra_mercancia: 0,
  }
  return movimientos.reduce((acc, m) => {
    acc[m.tipo] += m.valor
    return acc
  }, base)
}
