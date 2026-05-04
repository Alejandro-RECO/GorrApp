import { describe, it, expect } from 'vitest'
import { calcularSaldoDia, calcularSaldoPorMedio, esIngreso } from '../caja.utils'

const movimientos = [
  { id: 'm1', user_id: 'u1', tipo: 'ingreso_venta' as const,    valor: 50000, medio_pago: 'efectivo' as const, fecha: '2026-05-03', descripcion: null, created_at: '2026-05-03T10:00:00Z' },
  { id: 'm2', user_id: 'u1', tipo: 'ingreso_abono' as const,    valor: 20000, medio_pago: 'digital'  as const, fecha: '2026-05-03', descripcion: null, created_at: '2026-05-03T11:00:00Z' },
  { id: 'm3', user_id: 'u1', tipo: 'gasto_operativo' as const,  valor: 10000, medio_pago: 'efectivo' as const, fecha: '2026-05-03', descripcion: null, created_at: '2026-05-03T12:00:00Z' },
  { id: 'm4', user_id: 'u1', tipo: 'compra_mercancia' as const,  valor: 30000, medio_pago: 'digital'  as const, fecha: '2026-05-03', descripcion: null, created_at: '2026-05-03T13:00:00Z' },
]
// ingresos efectivo: 50 000  digital: 20 000  → total ingresos: 70 000
// egresos  efectivo: 10 000  digital: 30 000  → total egresos:  40 000
// saldo día: 30 000

describe('calcularSaldoDia', () => {
  it('retorna suma de ingresos menos suma de egresos', () => {
    expect(calcularSaldoDia(movimientos)).toBe(30000)
  })

  it('retorna 0 cuando no hay movimientos', () => {
    expect(calcularSaldoDia([])).toBe(0)
  })
})

describe('calcularSaldoPorMedio', () => {
  it('retorna saldo solo para medio efectivo', () => {
    // ingreso_venta 50 000 efectivo − gasto_operativo 10 000 efectivo = 40 000
    expect(calcularSaldoPorMedio(movimientos, 'efectivo')).toBe(40000)
  })

  it('retorna saldo solo para medio digital', () => {
    // ingreso_abono 20 000 digital − compra_mercancia 30 000 digital = −10 000
    expect(calcularSaldoPorMedio(movimientos, 'digital')).toBe(-10000)
  })
})

describe('esIngreso', () => {
  it('retorna true para ingreso_venta', () => {
    expect(esIngreso('ingreso_venta')).toBe(true)
  })

  it('retorna true para ingreso_abono', () => {
    expect(esIngreso('ingreso_abono')).toBe(true)
  })

  it('retorna false para gasto_operativo', () => {
    expect(esIngreso('gasto_operativo')).toBe(false)
  })

  it('retorna false para gasto_inversion', () => {
    expect(esIngreso('gasto_inversion')).toBe(false)
  })

  it('retorna false para compra_mercancia', () => {
    expect(esIngreso('compra_mercancia')).toBe(false)
  })
})
