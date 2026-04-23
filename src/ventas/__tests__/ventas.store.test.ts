import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'

vi.mock('../ventas.service', () => ({
  VentasService: {
    obtenerTodos: vi.fn(),
    crear: vi.fn(),
    obtenerPorCliente: vi.fn(),
  },
}))

import { useVentasStore } from '../ventas.store'
import { VentasService } from '../ventas.service'

const mockVenta = {
  id: 'v-1',
  user_id: 'user-1',
  cliente_id: 'c-1',
  total: 100000,
  tipo: 'contado' as const,
  medio_pago: 'efectivo' as const,
  notas: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  clientes: { nombre: 'Juan Pérez' },
}

const resetStore = () =>
  useVentasStore.setState({ ventas: [], cargando: false, error: null })

beforeEach(() => {
  vi.clearAllMocks()
  resetStore()
})

describe('useVentasStore', () => {
  describe('cargarVentas', () => {
    it('carga ventas del service y las guarda en el store', async () => {
      vi.mocked(VentasService.obtenerTodos).mockResolvedValueOnce([mockVenta])

      const { result } = renderHook(() => useVentasStore())
      await act(async () => {
        await result.current.cargarVentas()
      })

      expect(result.current.ventas).toHaveLength(1)
      expect(result.current.cargando).toBe(false)
    })

    it('guarda mensaje de error si el service falla', async () => {
      vi.mocked(VentasService.obtenerTodos).mockRejectedValueOnce(new Error('Error'))

      const { result } = renderHook(() => useVentasStore())
      await act(async () => {
        await result.current.cargarVentas()
      })

      expect(result.current.error).toBe('No se pudieron cargar las ventas')
      expect(result.current.cargando).toBe(false)
    })
  })

  describe('agregarVenta', () => {
    it('agrega la venta al inicio de la lista', async () => {
      vi.mocked(VentasService.crear).mockResolvedValueOnce(mockVenta)

      const { result } = renderHook(() => useVentasStore())
      await act(async () => {
        await result.current.agregarVenta({
          cliente_id: 'c-1',
          total: 100000,
          tipo: 'contado',
          medio_pago: 'efectivo',
        })
      })

      expect(result.current.ventas).toHaveLength(1)
      expect(result.current.ventas[0].id).toBe('v-1')
    })

    it('guarda mensaje de error si el service falla', async () => {
      vi.mocked(VentasService.crear).mockRejectedValueOnce(new Error('Error'))

      const { result } = renderHook(() => useVentasStore())
      await act(async () => {
        await result.current.agregarVenta({
          cliente_id: 'c-1',
          total: 100000,
          tipo: 'contado',
          medio_pago: 'efectivo',
        })
      })

      expect(result.current.error).toBe('No se pudo registrar la venta')
    })
  })

  describe('cargarVentasPorCliente', () => {
    it('carga ventas filtradas por cliente', async () => {
      vi.mocked(VentasService.obtenerPorCliente).mockResolvedValueOnce([mockVenta])

      const { result } = renderHook(() => useVentasStore())
      await act(async () => {
        await result.current.cargarVentasPorCliente('c-1')
      })

      expect(VentasService.obtenerPorCliente).toHaveBeenCalledWith('c-1')
      expect(result.current.ventas).toHaveLength(1)
    })

    it('guarda mensaje de error si el service falla', async () => {
      vi.mocked(VentasService.obtenerPorCliente).mockRejectedValueOnce(new Error('Error'))

      const { result } = renderHook(() => useVentasStore())
      await act(async () => {
        await result.current.cargarVentasPorCliente('c-1')
      })

      expect(result.current.error).toBe('No se pudieron cargar las ventas del cliente')
    })
  })
})
