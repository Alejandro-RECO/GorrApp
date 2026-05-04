import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@/test-utils/supabase.mock'
import { mockSupabase, mockQueryBuilder } from '@/test-utils/supabase.mock'
import { CajaService } from '../caja.service'

const mockMovimiento = {
  id: 'mov-1',
  user_id: 'u1',
  tipo: 'ingreso_venta',
  valor: 50000,
  medio_pago: 'efectivo',
  fecha: '2026-05-03',
  descripcion: null,
  created_at: '2026-05-03T10:00:00Z',
}

beforeEach(() => {
  vi.clearAllMocks()
  mockQueryBuilder.select.mockReturnValue(mockQueryBuilder)
  mockQueryBuilder.insert.mockReturnValue(mockQueryBuilder)
  mockQueryBuilder.eq.mockReturnValue(mockQueryBuilder)
  mockQueryBuilder.gte.mockReturnValue(mockQueryBuilder)
  mockQueryBuilder.lte.mockResolvedValue({ data: [], error: null })
  mockQueryBuilder.order.mockResolvedValue({ data: [], error: null })
  mockQueryBuilder.single.mockResolvedValue({ data: null, error: null })
  mockSupabase.from.mockReturnValue(mockQueryBuilder)
})

describe('CajaService', () => {
  describe('obtenerMovimientosDia', () => {
    it('retorna movimientos filtrados por fecha', async () => {
      mockQueryBuilder.order.mockResolvedValueOnce({ data: [mockMovimiento], error: null })

      const resultado = await CajaService.obtenerMovimientosDia('2026-05-03')

      expect(resultado).toHaveLength(1)
      expect(resultado[0].tipo).toBe('ingreso_venta')
      expect(mockSupabase.from).toHaveBeenCalledWith('movimientos_caja')
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('fecha', '2026-05-03')
    })

    it('retorna array vacío si no hay movimientos en la fecha', async () => {
      mockQueryBuilder.order.mockResolvedValueOnce({ data: [], error: null })

      const resultado = await CajaService.obtenerMovimientosDia('2026-05-03')

      expect(resultado).toHaveLength(0)
    })

    it('lanza error si Supabase retorna error', async () => {
      mockQueryBuilder.order.mockResolvedValueOnce({ data: null, error: { message: 'DB error' } })

      await expect(CajaService.obtenerMovimientosDia('2026-05-03')).rejects.toThrow('DB error')
    })
  })

  describe('registrarMovimiento', () => {
    it('inserta el movimiento en movimientos_caja', async () => {
      mockQueryBuilder.single.mockResolvedValueOnce({ data: mockMovimiento, error: null })

      const resultado = await CajaService.registrarMovimiento({
        tipo: 'ingreso_venta',
        valor: 50000,
        medioPago: 'efectivo',
        fecha: '2026-05-03',
      })

      expect(mockSupabase.from).toHaveBeenCalledWith('movimientos_caja')
      expect(mockQueryBuilder.insert).toHaveBeenCalled()
      expect(resultado.tipo).toBe('ingreso_venta')
    })
  })

  describe('obtenerResumenPeriodo', () => {
    it('retorna movimientos entre las fechas indicadas', async () => {
      const movimientos = [
        { ...mockMovimiento, fecha: '2026-05-01' },
        { ...mockMovimiento, id: 'mov-2', fecha: '2026-05-03' },
      ]
      mockQueryBuilder.lte.mockResolvedValueOnce({ data: movimientos, error: null })

      const resultado = await CajaService.obtenerResumenPeriodo('2026-05-01', '2026-05-03')

      expect(resultado).toHaveLength(2)
      expect(mockSupabase.from).toHaveBeenCalledWith('movimientos_caja')
      expect(mockQueryBuilder.gte).toHaveBeenCalledWith('fecha', '2026-05-01')
      expect(mockQueryBuilder.lte).toHaveBeenCalledWith('fecha', '2026-05-03')
    })

    it('retorna array vacío si no hay movimientos en el período', async () => {
      mockQueryBuilder.lte.mockResolvedValueOnce({ data: [], error: null })

      const resultado = await CajaService.obtenerResumenPeriodo('2026-05-01', '2026-05-03')

      expect(resultado).toHaveLength(0)
    })
  })
})
