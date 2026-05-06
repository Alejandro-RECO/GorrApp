import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@/test-utils/supabase.mock'
import { mockSupabase, mockQueryBuilder } from '@/test-utils/supabase.mock'
import { ReportesService } from '../reportes.service'

const mockVenta = {
  id: 'v-1',
  user_id: 'test-user-id',
  cliente_id: 'c-1',
  total: 80000,
  tipo: 'contado' as const,
  medio_pago: 'efectivo' as const,
  notas: null,
  created_at: '2026-05-01T10:00:00Z',
  updated_at: '2026-05-01T10:00:00Z',
}

const mockCuota = {
  id: 'q-1',
  venta_id: 'v-1',
  numero_cuota: 1,
  valor: 50000,
  fecha_vencimiento: '2026-06-01',
  estado: 'pendiente' as const,
  created_at: '2026-05-01T00:00:00Z',
  updated_at: '2026-05-01T00:00:00Z',
  ventas: { id: 'v-1', total: 80000, clientes: { id: 'c-1', nombre: 'Juan Pérez', telefono: '3001234567' } },
}

const mockMovimiento = {
  id: 'mov-1',
  user_id: 'test-user-id',
  tipo: 'ingreso_venta' as const,
  valor: 80000,
  medio_pago: 'efectivo' as const,
  fecha: '2026-05-01',
  descripcion: null,
  created_at: '2026-05-01T10:00:00Z',
}

beforeEach(() => {
  vi.clearAllMocks()
  mockQueryBuilder.select.mockReturnValue(mockQueryBuilder)
  mockQueryBuilder.insert.mockReturnValue(mockQueryBuilder)
  mockQueryBuilder.update.mockReturnValue(mockQueryBuilder)
  mockQueryBuilder.eq.mockReturnValue(mockQueryBuilder)
  mockQueryBuilder.gte.mockReturnValue(mockQueryBuilder)
  mockQueryBuilder.lte.mockResolvedValue({ data: [], error: null })
  mockQueryBuilder.order.mockResolvedValue({ data: [], error: null })
  mockQueryBuilder.single.mockResolvedValue({ data: null, error: null })
  mockSupabase.from.mockReturnValue(mockQueryBuilder)
})

describe('ReportesService', () => {
  describe('obtenerResumenGeneral', () => {
    it('consulta tabla ventas', async () => {
      mockQueryBuilder.order
        .mockResolvedValueOnce({ data: [mockVenta], error: null })
        .mockResolvedValueOnce({ data: [mockCuota], error: null })
        .mockResolvedValueOnce({ data: [mockMovimiento], error: null })

      await ReportesService.obtenerResumenGeneral()

      const llamadas = mockSupabase.from.mock.calls.map((c: string[]) => c[0])
      expect(llamadas).toContain('ventas')
    })

    it('consulta tabla cuotas', async () => {
      mockQueryBuilder.order
        .mockResolvedValueOnce({ data: [mockVenta], error: null })
        .mockResolvedValueOnce({ data: [mockCuota], error: null })
        .mockResolvedValueOnce({ data: [mockMovimiento], error: null })

      await ReportesService.obtenerResumenGeneral()

      const llamadas = mockSupabase.from.mock.calls.map((c: string[]) => c[0])
      expect(llamadas).toContain('cuotas')
    })

    it('consulta tabla movimientos_caja', async () => {
      mockQueryBuilder.order
        .mockResolvedValueOnce({ data: [mockVenta], error: null })
        .mockResolvedValueOnce({ data: [mockCuota], error: null })
        .mockResolvedValueOnce({ data: [mockMovimiento], error: null })

      await ReportesService.obtenerResumenGeneral()

      const llamadas = mockSupabase.from.mock.calls.map((c: string[]) => c[0])
      expect(llamadas).toContain('movimientos_caja')
    })
  })

  describe('obtenerVentasPeriodo', () => {
    it('filtra ventas por fecha con gte y lte', async () => {
      mockQueryBuilder.lte.mockResolvedValueOnce({ data: [mockVenta], error: null })

      const resultado = await ReportesService.obtenerVentasPeriodo('2026-05-01', '2026-05-31')

      expect(mockSupabase.from).toHaveBeenCalledWith('ventas')
      expect(mockQueryBuilder.gte).toHaveBeenCalledWith('created_at', '2026-05-01')
      expect(mockQueryBuilder.lte).toHaveBeenCalledWith('created_at', '2026-05-31')
      expect(resultado).toHaveLength(1)
    })

    it('retorna array vacío si no hay ventas en el período', async () => {
      mockQueryBuilder.lte.mockResolvedValueOnce({ data: [], error: null })

      const resultado = await ReportesService.obtenerVentasPeriodo('2026-05-01', '2026-05-31')

      expect(resultado).toHaveLength(0)
    })
  })

  describe('obtenerCarteraPendiente', () => {
    it('hace select en tabla cuotas', async () => {
      mockQueryBuilder.order.mockResolvedValueOnce({ data: [mockCuota], error: null })

      await ReportesService.obtenerCarteraPendiente()

      expect(mockSupabase.from).toHaveBeenCalledWith('cuotas')
    })

    it('retorna cuotas pendientes con datos de cliente', async () => {
      mockQueryBuilder.order.mockResolvedValueOnce({ data: [mockCuota], error: null })

      const resultado = await ReportesService.obtenerCarteraPendiente()

      expect(resultado).toHaveLength(1)
      expect(resultado[0].estado).toBe('pendiente')
    })
  })
})
