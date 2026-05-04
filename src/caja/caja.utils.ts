import type { Movimiento, MedioPago, TipoMovimiento } from './caja.types'

export function calcularSaldoDia(_movimientos: Movimiento[]): number {
  throw new Error('not implemented')
}

export function calcularSaldoPorMedio(_movimientos: Movimiento[], _medio: MedioPago): number {
  throw new Error('not implemented')
}

export function esIngreso(_tipo: TipoMovimiento | string): boolean {
  throw new Error('not implemented')
}
