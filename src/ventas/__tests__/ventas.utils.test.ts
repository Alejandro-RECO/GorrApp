import { describe, it, expect } from 'vitest'
import { calcularCuotas, calcularTotalVenta, validarVenta } from '../ventas.utils'

const FECHA_VENTA = new Date('2026-04-23T12:00:00Z')

describe('calcularCuotas', () => {
  describe('cuando tipo es contado', () => {
    it('retorna array vacío', () => {
      const cuotas = calcularCuotas({ total: 100000, tipo: 'contado', fechaVenta: FECHA_VENTA })
      expect(cuotas).toHaveLength(0)
    })
  })

  describe('cuando tipo es fiado_una_cuota', () => {
    it('retorna 1 cuota con el total completo', () => {
      const cuotas = calcularCuotas({ total: 100000, tipo: 'fiado_una_cuota', fechaVenta: FECHA_VENTA })
      expect(cuotas).toHaveLength(1)
      expect(cuotas[0].valor).toBe(100000)
      expect(cuotas[0].numero_cuota).toBe(1)
    })

    it('fecha vencimiento es 30 días desde fechaVenta', () => {
      const cuotas = calcularCuotas({ total: 100000, tipo: 'fiado_una_cuota', fechaVenta: FECHA_VENTA })
      expect(cuotas[0].fecha_vencimiento).toBe('2026-05-23')
    })
  })

  describe('cuando tipo es fiado_dos_cuotas', () => {
    it('retorna 2 cuotas con valor igual (total / 2 redondeado)', () => {
      const cuotas = calcularCuotas({ total: 100000, tipo: 'fiado_dos_cuotas', fechaVenta: FECHA_VENTA })
      expect(cuotas).toHaveLength(2)
      expect(cuotas[0].valor).toBe(50000)
      expect(cuotas[1].valor).toBe(50000)
    })

    it('primera cuota vence a 15 días', () => {
      const cuotas = calcularCuotas({ total: 100000, tipo: 'fiado_dos_cuotas', fechaVenta: FECHA_VENTA })
      expect(cuotas[0].fecha_vencimiento).toBe('2026-05-08')
    })

    it('segunda cuota vence a 30 días', () => {
      const cuotas = calcularCuotas({ total: 100000, tipo: 'fiado_dos_cuotas', fechaVenta: FECHA_VENTA })
      expect(cuotas[1].fecha_vencimiento).toBe('2026-05-23')
    })
  })
})

describe('calcularTotalVenta', () => {
  it('retorna suma de todos los items (precio * cantidad)', () => {
    const items = [
      { precio: 50000, cantidad: 2 },
      { precio: 30000, cantidad: 1 },
    ]
    expect(calcularTotalVenta(items)).toBe(130000)
  })

  it('retorna 0 si items está vacío', () => {
    expect(calcularTotalVenta([])).toBe(0)
  })
})

describe('validarVenta', () => {
  it('retorna error si clienteId está vacío', () => {
    const error = validarVenta({ clienteId: '', total: 100000, tipo: 'contado' })
    expect(error).not.toBeNull()
  })

  it('retorna error si total es 0 o negativo', () => {
    const errorCero = validarVenta({ clienteId: 'c-1', total: 0, tipo: 'contado' })
    const errorNeg = validarVenta({ clienteId: 'c-1', total: -1000, tipo: 'contado' })
    expect(errorCero).not.toBeNull()
    expect(errorNeg).not.toBeNull()
  })

  it('retorna error si tipo no es válido', () => {
    const error = validarVenta({ clienteId: 'c-1', total: 100000, tipo: 'invalido' })
    expect(error).not.toBeNull()
  })

  it('retorna null si todos los campos son válidos', () => {
    const error = validarVenta({ clienteId: 'c-1', total: 100000, tipo: 'contado' })
    expect(error).toBeNull()
  })
})
