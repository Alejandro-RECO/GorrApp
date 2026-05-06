import { describe, it, expect } from 'vitest'
import { calcularSaldoPendiente, cuotaEstaPagada, cuotaEstaVencida, generarMensajeCobro } from '../cobros.utils'
import type { EstadoCuota } from '../cobros.types'

type Abono = {
  id: string
  valor: number
  user_id: string
  cuota_id: string
  medio_pago: 'efectivo'
  notas: string
  created_at: string
}

describe('calcularSaldoPendiente', () => {
  describe('cuando la cuota tiene abonos', () => {
    it('retorna valor de la cuota menos la suma de los abonos', () => {
      const cuota = { id: 'c1', valor: 50000 }
      const abonos = [
        { id: 'a1', valor: 20000, user_id: 'u1', cuota_id: 'c1', medio_pago: 'efectivo' as const, notas: '', created_at: new Date().toISOString() },
        { id: 'a2', valor: 15000, user_id: 'u1', cuota_id: 'c1', medio_pago: 'efectivo' as const, notas: '', created_at: new Date().toISOString() }
      ]

      const saldo = calcularSaldoPendiente(cuota, abonos)

      expect(saldo).toBe(15000)
    })
  })

  describe('cuando no hay abonos', () => {
    it('retorna el valor completo de la cuota', () => {
      const cuota = { id: 'c1', valor: 50000 }
      const abonos: Abono[] = []

      const saldo = calcularSaldoPendiente(cuota, abonos)

      expect(saldo).toBe(50000)
    })
  })

  describe('cuando los abonos cubren exactamente el valor', () => {
    it('retorna 0', () => {
      const cuota = { id: 'c1', valor: 50000 }
      const abonos = [{ id: 'a1', valor: 50000, user_id: 'u1', cuota_id: 'c1', medio_pago: 'efectivo' as const, notas: '', created_at: new Date().toISOString() }]

      const saldo = calcularSaldoPendiente(cuota, abonos)

      expect(saldo).toBe(0)
    })
  })
})

describe('cuotaEstaPagada', () => {
  describe('cuando el saldo es menor o igual a 0', () => {
    it('retorna true', () => {
      const cuota = { id: 'c1', valor: 50000 }
      const abonos = [{ id: 'a1', valor: 50000, user_id: 'u1', cuota_id: 'c1', medio_pago: 'efectivo' as const, notas: '', created_at: new Date().toISOString() }]

      const estaPagada = cuotaEstaPagada(cuota, abonos)

      expect(estaPagada).toBe(true)
    })
  })

  describe('cuando hay saldo pendiente', () => {
    it('retorna false', () => {
      const cuota = { id: 'c1', valor: 50000 }
      const abonos = [{ id: 'a1', valor: 10000, user_id: 'u1', cuota_id: 'c1', medio_pago: 'efectivo' as const, notas: '', created_at: new Date().toISOString() }]

      const estaPagada = cuotaEstaPagada(cuota, abonos)

      expect(estaPagada).toBe(false)
    })
  })
})

describe('cuotaEstaVencida', () => {
  describe('cuando la cuota está pendiente y vencida', () => {
    it('retorna true', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const cuota = {
        id: 'c1',
        venta_id: 'v1',
        numero_cuota: 1,
        valor: 50000,
        fecha_vencimiento: yesterday.toISOString().split('T')[0],
        estado: 'pendiente' as EstadoCuota,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const estaVencida = cuotaEstaVencida(cuota)

      expect(estaVencida).toBe(true)
    })
  })

  describe('cuando la cuota está pagada aunque vencida', () => {
    it('retorna false', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const cuota = {
        id: 'c1',
        venta_id: 'v1',
        numero_cuota: 1,
        valor: 50000,
        fecha_vencimiento: yesterday.toISOString().split('T')[0],
        estado: 'pagada' as EstadoCuota,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const estaVencida = cuotaEstaVencida(cuota)

      expect(estaVencida).toBe(false)
    })
  })

  describe('cuando la cuota no ha vencido', () => {
    it('retorna false', () => {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      const cuota = {
        id: 'c1',
        venta_id: 'v1',
        numero_cuota: 1,
        valor: 50000,
        fecha_vencimiento: tomorrow.toISOString().split('T')[0],
        estado: 'pendiente' as EstadoCuota,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const estaVencida = cuotaEstaVencida(cuota)

      expect(estaVencida).toBe(false)
    })
  })
})

describe('generarMensajeCobro', () => {
  it('genera mensaje con nombre del cliente y cuotas pendientes', () => {
    const cliente = { nombre: 'Juan Pérez', telefono: '3001234567' }
    const cuotas = [
      { id: 'c1', venta_id: 'v1', numero_cuota: 1, valor: 50000, fecha_vencimiento: '2025-01-15', estado: 'pendiente' as EstadoCuota, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
      { id: 'c2', venta_id: 'v1', numero_cuota: 2, valor: 50000, fecha_vencimiento: '2025-01-30', estado: 'pendiente' as EstadoCuota, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
    ]

    const mensaje = generarMensajeCobro(cliente, cuotas)

    expect(mensaje).toContain('Juan Pérez')
    expect(mensaje).toContain('100.000')
  })
})