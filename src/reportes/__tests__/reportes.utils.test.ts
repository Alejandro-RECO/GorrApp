import { describe, it, expect } from 'vitest'
import {
  calcularTotalVendido,
  calcularTotalCartera,
  calcularRentabilidad,
  agruparVentasPorDia,
  clientesEnMora,
} from '../reportes.utils'

const ventas = [
  { id: 'v-1', user_id: 'u1', cliente_id: 'c-1', total: 80000, tipo: 'contado' as const,          medio_pago: 'efectivo' as const, notas: null, created_at: '2026-05-01T10:00:00Z', updated_at: '2026-05-01T10:00:00Z' },
  { id: 'v-2', user_id: 'u1', cliente_id: 'c-2', total: 60000, tipo: 'contado' as const,          medio_pago: 'digital'  as const, notas: null, created_at: '2026-05-01T15:00:00Z', updated_at: '2026-05-01T15:00:00Z' },
  { id: 'v-3', user_id: 'u1', cliente_id: 'c-1', total: 100000, tipo: 'fiado_dos_cuotas' as const, medio_pago: 'efectivo' as const, notas: null, created_at: '2026-05-02T09:00:00Z', updated_at: '2026-05-02T09:00:00Z' },
]
// total ventas: 80000 + 60000 + 100000 = 240000

const compras = [
  { id: 'cp-1', user_id: 'u1', producto_id: 'p-1', cantidad: 10, precio_compra: 30000, total: 300000, proveedor: null, notas: null, created_at: '2026-05-01T08:00:00Z' },
  { id: 'cp-2', user_id: 'u1', producto_id: 'p-2', cantidad: 5,  precio_compra: 20000, total: 100000, proveedor: null, notas: null, created_at: '2026-05-02T08:00:00Z' },
]
// total compras: 400000 → rentabilidad: 240000 - 400000 = -160000

const cuotas = [
  { id: 'q-1', venta_id: 'v-3', numero_cuota: 1, valor: 50000, fecha_vencimiento: '2025-01-15', estado: 'vencida'   as const, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'q-2', venta_id: 'v-3', numero_cuota: 2, valor: 50000, fecha_vencimiento: '2025-01-30', estado: 'pendiente' as const, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'q-3', venta_id: 'v-2', numero_cuota: 1, valor: 60000, fecha_vencimiento: '2025-02-01', estado: 'pagada'    as const, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
]
// cartera (pendiente + vencida): 50000 + 50000 = 100000

const clientes = [
  { id: 'c-1', user_id: 'u1', nombre: 'Juan Pérez',    telefono: '3001234567', notas: null, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
  { id: 'c-2', user_id: 'u1', nombre: 'María García',  telefono: '3007654321', notas: null, created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z' },
]

const cuotasConCliente = [
  {
    id: 'q-1', venta_id: 'v-3', numero_cuota: 1, valor: 50000,
    fecha_vencimiento: '2025-01-15', estado: 'vencida' as const,
    created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z',
    ventas: { id: 'v-3', total: 100000, clientes: { id: 'c-1', nombre: 'Juan Pérez', telefono: '3001234567' } },
  },
  {
    id: 'q-2', venta_id: 'v-3', numero_cuota: 2, valor: 50000,
    fecha_vencimiento: '2025-01-30', estado: 'pendiente' as const,
    created_at: '2026-01-01T00:00:00Z', updated_at: '2026-01-01T00:00:00Z',
    ventas: { id: 'v-3', total: 100000, clientes: { id: 'c-1', nombre: 'Juan Pérez', telefono: '3001234567' } },
  },
]

describe('calcularTotalVendido', () => {
  describe('cuando hay ventas', () => {
    it('retorna suma de todos los totales', () => {
      expect(calcularTotalVendido(ventas)).toBe(240000)
    })
  })

  describe('cuando no hay ventas', () => {
    it('retorna 0', () => {
      expect(calcularTotalVendido([])).toBe(0)
    })
  })
})

describe('calcularTotalCartera', () => {
  describe('cuando hay cuotas mixtas', () => {
    it('retorna suma de cuotas pendientes y vencidas sin incluir pagadas', () => {
      // vencida 50000 + pendiente 50000 = 100000; pagada 60000 excluida
      expect(calcularTotalCartera(cuotas)).toBe(100000)
    })
  })

  describe('cuando no hay cuotas', () => {
    it('retorna 0', () => {
      expect(calcularTotalCartera([])).toBe(0)
    })
  })
})

describe('calcularRentabilidad', () => {
  describe('cuando ventas superan compras', () => {
    it('retorna valor positivo', () => {
      const ventasSimples = [{ ...ventas[0], total: 500000 }]
      const comprasSimples = [{ ...compras[0], total: 300000 }]
      expect(calcularRentabilidad(ventasSimples, comprasSimples)).toBe(200000)
    })
  })

  describe('cuando compras superan ventas', () => {
    it('retorna totalVentas menos totalCompras', () => {
      expect(calcularRentabilidad(ventas, compras)).toBe(-160000)
    })
  })
})

describe('agruparVentasPorDia', () => {
  describe('cuando hay ventas en días distintos', () => {
    it('agrupa y suma totales por fecha', () => {
      const resultado = agruparVentasPorDia(ventas)
      // v-1 y v-2 son del 2026-05-01: 80000 + 60000 = 140000
      // v-3 es del 2026-05-02: 100000
      expect(resultado['2026-05-01']).toBe(140000)
      expect(resultado['2026-05-02']).toBe(100000)
    })
  })

  describe('cuando no hay ventas', () => {
    it('retorna objeto vacío', () => {
      expect(agruparVentasPorDia([])).toEqual({})
    })
  })
})

describe('clientesEnMora', () => {
  describe('cuando hay clientes con cuotas vencidas', () => {
    it('retorna solo los clientes con al menos una cuota vencida', () => {
      // c-1 tiene cuota vencida; c-2 no aparece en cuotasConCliente con vencida
      const resultado = clientesEnMora(clientes, cuotasConCliente)
      expect(resultado).toHaveLength(1)
      expect(resultado[0].id).toBe('c-1')
    })
  })

  describe('cuando ningún cliente tiene cuotas vencidas', () => {
    it('retorna array vacío', () => {
      const sinVencidas = cuotasConCliente.filter(c => c.estado !== 'vencida')
      expect(clientesEnMora(clientes, sinVencidas)).toHaveLength(0)
    })
  })
})
