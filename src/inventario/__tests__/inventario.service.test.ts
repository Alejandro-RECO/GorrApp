import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@/test-utils/supabase.mock'
import { mockSupabase, mockQueryBuilder } from '@/test-utils/supabase.mock'
import { InventarioService } from '../inventario.service'

const mockProducto = {
  id: 'p-1',
  user_id: 'test-user-id',
  nombre: 'Gorra New Era',
  precio_venta: 50000,
  precio_compra: 30000,
  stock_actual: 10,
  stock_minimo: 5,
  created_at: '2026-05-05T00:00:00Z',
}

const mockCompra = {
  id: 'comp-1',
  user_id: 'test-user-id',
  producto_id: 'p-1',
  cantidad: 20,
  precio_unitario: 30000,
  total: 600000,
  medio_pago: 'efectivo' as const,
  fecha: '2026-05-05',
  created_at: '2026-05-05T00:00:00Z',
}

const datosCompra = {
  producto_id: 'p-1',
  cantidad: 20,
  precio_unitario: 30000,
  medio_pago: 'efectivo' as const,
  fecha: '2026-05-05',
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

describe('InventarioService', () => {
  describe('obtenerTodos', () => {
    it('hace select en tabla productos del usuario', async () => {
      mockQueryBuilder.order.mockResolvedValueOnce({ data: [mockProducto], error: null })

      const resultado = await InventarioService.obtenerTodos()

      expect(mockSupabase.from).toHaveBeenCalledWith('productos')
      expect(resultado).toHaveLength(1)
    })

    it('retorna array vacío si no hay productos', async () => {
      mockQueryBuilder.order.mockResolvedValueOnce({ data: [], error: null })

      const resultado = await InventarioService.obtenerTodos()

      expect(resultado).toHaveLength(0)
    })
  })

  describe('registrarCompra', () => {
    it('inserta en tabla compras_inventario', async () => {
      mockQueryBuilder.single
        .mockResolvedValueOnce({ data: mockCompra, error: null })
        .mockResolvedValueOnce({ data: { ...mockProducto, stock_actual: 30 }, error: null })
        .mockResolvedValueOnce({ data: { id: 'mov-1' }, error: null })

      await InventarioService.registrarCompra(datosCompra)

      const llamadas = mockSupabase.from.mock.calls.map((c: string[]) => c[0])
      expect(llamadas).toContain('compras_inventario')
    })

    it('incrementa stock_actual en tabla productos', async () => {
      mockQueryBuilder.single
        .mockResolvedValueOnce({ data: mockCompra, error: null })
        .mockResolvedValueOnce({ data: { ...mockProducto, stock_actual: 30 }, error: null })
        .mockResolvedValueOnce({ data: { id: 'mov-1' }, error: null })

      await InventarioService.registrarCompra(datosCompra)

      const llamadas = mockSupabase.from.mock.calls.map((c: string[]) => c[0])
      expect(llamadas).toContain('productos')
      expect(mockQueryBuilder.update).toHaveBeenCalled()
    })

    it('registra movimiento en movimientos_caja con tipo compra_mercancia', async () => {
      mockQueryBuilder.single
        .mockResolvedValueOnce({ data: mockCompra, error: null })
        .mockResolvedValueOnce({ data: { ...mockProducto, stock_actual: 30 }, error: null })
        .mockResolvedValueOnce({ data: { id: 'mov-1' }, error: null })

      await InventarioService.registrarCompra(datosCompra)

      const llamadas = mockSupabase.from.mock.calls.map((c: string[]) => c[0])
      expect(llamadas).toContain('movimientos_caja')
    })
  })

  describe('actualizarProducto', () => {
    it('hace update en tabla productos con el id correcto', async () => {
      mockQueryBuilder.single.mockResolvedValueOnce({
        data: { ...mockProducto, precio_venta: 60000 },
        error: null,
      })

      await InventarioService.actualizarProducto('p-1', { precio_venta: 60000 })

      expect(mockSupabase.from).toHaveBeenCalledWith('productos')
      expect(mockQueryBuilder.update).toHaveBeenCalled()
      expect(mockQueryBuilder.eq).toHaveBeenCalledWith('id', 'p-1')
    })
  })
})
