import { describe, it, expect } from 'vitest'
import { calcularDeudaTotal, estaEnMora } from '../clientes.utils'

type CuotaTest = { valor: number; estado: 'pendiente' | 'pagada' | 'vencida'; fecha_vencimiento: string }

describe('calcularDeudaTotal', () => {
  it('retorna suma de cuotas pendientes (pendiente + vencida)', () => {
    const cuotas: CuotaTest[] = [
      { valor: 50000, estado: 'pendiente', fecha_vencimiento: '2026-05-01' },
      { valor: 30000, estado: 'vencida', fecha_vencimiento: '2026-03-01' },
      { valor: 20000, estado: 'pagada', fecha_vencimiento: '2026-01-01' },
    ]
    expect(calcularDeudaTotal(cuotas)).toBe(80000)
  })

  it('retorna 0 si no hay cuotas', () => {
    expect(calcularDeudaTotal([])).toBe(0)
  })

  it('retorna 0 si todas las cuotas están pagadas', () => {
    const cuotas: CuotaTest[] = [
      { valor: 50000, estado: 'pagada', fecha_vencimiento: '2026-01-01' },
    ]
    expect(calcularDeudaTotal(cuotas)).toBe(0)
  })
})

describe('estaEnMora', () => {
  it('retorna true si hay al menos 1 cuota vencida', () => {
    const cuotas: CuotaTest[] = [
      { valor: 50000, estado: 'pendiente', fecha_vencimiento: '2026-05-01' },
      { valor: 30000, estado: 'vencida', fecha_vencimiento: '2026-03-01' },
    ]
    expect(estaEnMora(cuotas)).toBe(true)
  })

  it('retorna false si no hay cuotas', () => {
    expect(estaEnMora([])).toBe(false)
  })

  it('retorna false si todas las cuotas están pendientes o pagadas', () => {
    const cuotas: CuotaTest[] = [
      { valor: 50000, estado: 'pendiente', fecha_vencimiento: '2026-05-01' },
      { valor: 20000, estado: 'pagada', fecha_vencimiento: '2026-01-01' },
    ]
    expect(estaEnMora(cuotas)).toBe(false)
  })
})
