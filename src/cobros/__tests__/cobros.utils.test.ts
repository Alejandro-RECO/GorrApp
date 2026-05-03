import { describe, it, expect } from 'vitest'
import { calcularSaldoPendiente, cuotaEstaPagada, cuotaEstaVencida, generarMensajeCobro } from '../cobros.utils'

describe('calcularSaldoPendiente', () => {
  describe('cuando la cuota tiene abonos', () => {
    it('retorna valor de la cuota menos la suma de los abonos', () => {
      const cuota = { id: 'c1', valor: 50000 }
      const abonos = [
        { id: 'a1', valor: 20000 },
        { id: 'a2', valor: 15000 }
      ]

      const saldo = calcularSaldoPendiente(cuota, abonos)

      expect(saldo).toBe(15000)
    })
  })

  describe('cuando no hay abonos', () => {
    it('retorna el valor completo de la cuota', () => {
      const cuota = { id: 'c1', valor: 50000 }
      const abonos: { id: string; valor: number }[] = []

      const saldo = calcularSaldoPendiente(cuota, abonos)

      expect(saldo).toBe(50000)
    })
  })

  describe('cuando los abonos cubren exactamente el valor', () => {
    it('retorna 0', () => {
      const cuota = { id: 'c1', valor: 50000 }
      const abonos = [{ id: 'a1', valor: 50000 }]

      const saldo = calcularSaldoPendiente(cuota, abonos)

      expect(saldo).toBe(0)
    })
  })
})

describe('cuotaEstaPagada', () => {
  describe('cuando el saldo es menor o igual a 0', () => {
    it('retorna true', () => {
      const cuota = { id: 'c1', valor: 50000 }
      const abonos = [{ id: 'a1', valor: 50000 }]

      const estaPagada = cuotaEstaPagada(cuota, abonos)

      expect(estaPagada).toBe(true)
    })
  })

  describe('cuando hay saldo pendiente', () => {
    it('retorna false', () => {
      const cuota = { id: 'c1', valor: 50000 }
      const abonos = [{ id: 'a1', valor: 10000 }]

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
        valor: 50000,
        fecha_vencimiento: yesterday.toISOString().split('T')[0],
        estado: 'pendiente'
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
        valor: 50000,
        fecha_vencimiento: yesterday.toISOString().split('T')[0],
        estado: 'pagada'
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
        valor: 50000,
        fecha_vencimiento: tomorrow.toISOString().split('T')[0],
        estado: 'pendiente'
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
      { id: 'c1', numero_cuota: 1, valor: 50000, fecha_vencimiento: '2025-01-15', estado: 'pendiente' },
      { id: 'c2', numero_cuota: 2, valor: 50000, fecha_vencimiento: '2025-01-30', estado: 'pendiente' }
    ]

    const mensaje = generarMensajeCobro(cliente, cuotas)

    expect(mensaje).toContain('Juan Pérez')
    expect(mensaje).toContain('1.000')
  })
})