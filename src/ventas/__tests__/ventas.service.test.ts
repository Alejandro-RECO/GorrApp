import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@/test-utils/supabase.mock'
import { mockSupabase, mockQueryBuilder } from '@/test-utils/supabase.mock'
import { VentasService } from '../ventas.service'

vi.mock('@/shared/lib/getNegocioId', () => ({
  getAuthContext: () => ({ userId: 'test-user-id', negocioId: 'test-negocio-id' }),
}))

const mockVenta = {
  id: 'v-1',
  user_id: 'test-user-id',
  cliente_id: 'c-1',
  total: 100000,
  tipo: 'contado' as const,
  medio_pago: 'efectivo' as const,
  notas: null,
  created_at: '2026-04-26T00:00:00Z',
  updated_at: '2026-04-26T00:00:00Z',
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
    it('con tipo contado inserta en tabla ventas', async () => {
      mockQueryBuilder.single
        .mockResolvedValueOnce({ data: mockVenta, error: null })
        .mockResolvedValueOnce({ data: { id: 'mov-1' }, error: null })

      await VentasService.crear(datosContado)

      expect(mockSupabase.from).toHaveBeenCalledWith('ventas')
      expect(mockQueryBuilder.insert).toHaveBeenCalled()
    })

    it('con tipo contado registra ingreso_venta en movimientos_caja', async () => {
      mockQueryBuilder.single
        .mockResolvedValueOnce({ data: mockVenta, error: null })
        .mockResolvedValueOnce({ data: { id: 'mov-1' }, error: null })

      await VentasService.crear(datosContado)

      const calls = mockSupabase.from.mock.calls.map((c: string[]) => c[0])
      expect(calls).toContain('movimientos_caja')
    })

    it('con tipo contado NO inserta en tabla cuotas', async () => {
      mockQueryBuilder.single
        .mockResolvedValueOnce({ data: mockVenta, error: null })
        .mockResolvedValueOnce({ data: { id: 'mov-1' }, error: null })

      await VentasService.crear(datosContado)

      const calls = mockSupabase.from.mock.calls.map((c: string[]) => c[0])
      expect(calls).not.toContain('cuotas')
    })

    it('con tipo fiado inserta en ventas y en cuotas', async () => {
      const mockVentaFiada = { ...mockVenta, tipo: 'fiado_dos_cuotas' as const }
      mockQueryBuilder.single.mockResolvedValueOnce({ data: mockVentaFiada, error: null })

      await VentasService.crear(datosFiado)

      const calls = mockSupabase.from.mock.calls.map((c: string[]) => c[0])
      expect(calls).toContain('ventas')
      expect(calls).toContain('cuotas')
    })
  })

  describe('obtenerTodos', () => {
    it('hace select con join a clientes', async () => {
      mockQueryBuilder.order.mockResolvedValueOnce({
        data: [{ ...mockVenta, clientes: { nombre: 'Juan Pérez' } }],
        error: null,
      })

      await VentasService.obtenerTodos()

      expect(mockSupabase.from).toHaveBeenCalledWith('ventas')
      expect(mockQueryBuilder.select).toHaveBeenCalled()
    })
  })
})
