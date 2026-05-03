import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@/test-utils/supabase.mock'
import { mockSupabase, mockQueryBuilder } from '@/test-utils/supabase.mock'
import { CobrosService } from '../cobros.service'

const mockCuota = {
  id: 'c1',
  venta_id: 'v1',
  numero_cuota: 1,
  valor: 50000,
  fecha_vencimiento: '2025-01-15',
  estado: 'pendiente',
  ventas: { id: 'v1', total: 100000, clientes: { id: 'cl1', nombre: 'Juan Pérez', telefono: '3001234567' } }
}

const mockAbono = {
  id: 'a1',
  cuota_id: 'c1',
  valor: 50000,
  medio_pago: 'efectivo',
  created_at: '2025-01-10'
}

beforeEach(() => {
  vi.clearAllMocks()
  mockQueryBuilder.select.mockReturnValue(mockQueryBuilder)
  mockQueryBuilder.insert.mockReturnValue(mockQueryBuilder)
  mockQueryBuilder.update.mockReturnValue(mockQueryBuilder)
  mockQueryBuilder.eq.mockReturnValue(mockQueryBuilder)
  mockQueryBuilder.order.mockResolvedValue({ data: [], error: null })
  mockQueryBuilder.single.mockResolvedValue({ data: null, error: null })
  mockSupabase.from.mockReturnValue(mockQueryBuilder)
})

describe('CobrosService', () => {
  describe('obtenerCuotasPendientes', () => {
    it('retorna cuotas con estado pendiente', async () => {
      mockQueryBuilder.order.mockResolvedValueOnce({ data: [mockCuota], error: null })

      const result = await CobrosService.obtenerCuotasPendientes()

      expect(result).toHaveLength(1)
      expect(result[0].ventas.clientes.nombre).toBe('Juan Pérez')
      expect(mockSupabase.from).toHaveBeenCalledWith('cuotas')
    })
  })

  describe('registrarAbono', () => {
    it('inserta el abono en la tabla abonos', async () => {
      mockQueryBuilder.select.mockReturnValue(mockQueryBuilder)
      mockQueryBuilder.single
        .mockResolvedValueOnce({ data: mockAbono, error: null })
        .mockResolvedValueOnce({ data: { ...mockCuota, abonos: [mockAbono] }, error: null })

      await CobrosService.registrarAbono({
        cuotaId: 'c1',
        valor: 50000,
        medioPago: 'efectivo'
      })

      expect(mockSupabase.from).toHaveBeenCalledWith('abonos')
      expect(mockQueryBuilder.insert).toHaveBeenCalled()
    })
  })

  describe('obtenerAbonosPorCuota', () => {
    it('retorna abonos de la cuota', async () => {
      mockQueryBuilder.order.mockResolvedValueOnce({ data: [mockAbono], error: null })

      const result = await CobrosService.obtenerAbonosPorCuota('c1')

      expect(result).toHaveLength(1)
      expect(result[0].valor).toBe(50000)
    })

    it('retorna array vacío si no hay abonos', async () => {
      mockQueryBuilder.order.mockResolvedValueOnce({ data: [], error: null })

      const result = await CobrosService.obtenerAbonosPorCuota('c1')

      expect(result).toHaveLength(0)
    })
  })
})