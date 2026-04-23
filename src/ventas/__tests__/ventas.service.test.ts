import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@/test-utils/supabase.mock'
import { mockSupabase, mockQueryBuilder } from '@/test-utils/supabase.mock'
import { VentasService } from '../ventas.service'

const mockVenta = {
  id: 'v-1',
  user_id: 'test-user-id',
  cliente_id: 'c-1',
  total: 100000,
  tipo: 'contado' as const,
  medio_pago: 'efectivo' as const,
  notas: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

const datosContado = {
  cliente_id: 'c-1',
  total: 100000,
  tipo: 'contado' as const,
  medio_pago: 'efectivo' as const,
}

const datosFiado = {
  cliente_id: 'c-1',
  total: 100000,
  tipo: 'fiado_dos_cuotas' as const,
  medio_pago: 'efectivo' as const,
}

beforeEach(() => {
  vi.clearAllMocks()
  mockQueryBuilder.select.mockReturnValue(mockQueryBuilder)
  mockQueryBuilder.insert.mockReturnValue(mockQueryBuilder)
  mockQueryBuilder.update.mockReturnValue(mockQueryBuilder)
  mockQueryBuilder.delete.mockReturnValue(mockQueryBuilder)
  mockQueryBuilder.eq.mockReturnValue(mockQueryBuilder)
  mockQueryBuilder.order.mockResolvedValue({ data: [], error: null })
  mockQueryBuilder.single.mockResolvedValue({ data: null, error: null })
  mockSupabase.from.mockReturnValue(mockQueryBuilder)
})

describe('VentasService', () => {
  describe('crear', () => {
    it('llama insert en tabla ventas', async () => {
      mockQueryBuilder.single.mockResolvedValueOnce({ data: mockVenta, error: null })

      await VentasService.crear(datosContado)

      expect(mockSupabase.from).toHaveBeenCalledWith('ventas')
      expect(mockQueryBuilder.insert).toHaveBeenCalled()
    })

    it('con tipo fiado llama insert en tabla cuotas después de crear venta', async () => {
      const mockVentaFiada = { ...mockVenta, tipo: 'fiado_dos_cuotas' as const }
      mockQueryBuilder.single.mockResolvedValueOnce({ data: mockVentaFiada, error: null })

      await VentasService.crear(datosFiado)

      const calls = mockSupabase.from.mock.calls.map(c => c[0])
      expect(calls).toContain('ventas')
      expect(calls).toContain('cuotas')
    })

    it('con tipo contado NO inserta en tabla cuotas', async () => {
      mockQueryBuilder.single.mockResolvedValueOnce({ data: mockVenta, error: null })

      await VentasService.crear(datosContado)

      const calls = mockSupabase.from.mock.calls.map(c => c[0])
      expect(calls).not.toContain('cuotas')
    })
  })

  describe('obtenerTodos', () => {
    it('retorna ventas con join a clientes', async () => {
      mockQueryBuilder.order.mockResolvedValueOnce({
        data: [{ ...mockVenta, clientes: { nombre: 'Juan Pérez' } }],
        error: null,
      })

      await VentasService.obtenerTodos()

      expect(mockSupabase.from).toHaveBeenCalledWith('ventas')
      expect(mockQueryBuilder.select).toHaveBeenCalled()
    })
  })

  describe('obtenerPorCliente', () => {
    it('filtra por cliente_id', async () => {
      mockQueryBuilder.order.mockResolvedValueOnce({ data: [], error: null })

      await VentasService.obtenerPorCliente('c-1')

      expect(mockSupabase.from).toHaveBeenCalledWith('ventas')
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('cliente_id', 'c-1')
    })
  })
})
