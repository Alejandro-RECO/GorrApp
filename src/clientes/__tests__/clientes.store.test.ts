import { describe, it, expect, vi, beforeEach } from 'vitest'
import { act, renderHook } from '@testing-library/react'

vi.mock('../clientes.service', () => ({
  ClientesService: {
    obtenerTodos: vi.fn(),
    crear: vi.fn(),
    actualizar: vi.fn(),
    eliminar: vi.fn(),
  },
}))

import { useClientesStore } from '../clientes.store'
import { ClientesService } from '../clientes.service'

const mockCliente = {
  id: 'c-1',
  user_id: 'user-1',
  nombre: 'Juan Pérez',
  telefono: '3001234567',
  notas: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  cuotas: [],
}

const resetStore = () =>
  useClientesStore.setState({ clientes: [], cargando: false, error: null })

beforeEach(() => {
  vi.clearAllMocks()
  resetStore()
})

describe('useClientesStore', () => {
  describe('cargarClientes', () => {
    it('carga clientes del service y los guarda en el store', async () => {
      vi.mocked(ClientesService.obtenerTodos).mockResolvedValueOnce([mockCliente])

      const { result } = renderHook(() => useClientesStore())
      await act(async () => {
        await result.current.cargarClientes()
      })

      expect(result.current.clientes).toHaveLength(1)
      expect(result.current.clientes[0].nombre).toBe('Juan Pérez')
      expect(result.current.cargando).toBe(false)
    })

    it('guarda mensaje de error si el service falla', async () => {
      vi.mocked(ClientesService.obtenerTodos).mockRejectedValueOnce(new Error('Error de red'))

      const { result } = renderHook(() => useClientesStore())
      await act(async () => {
        await result.current.cargarClientes()
      })

      expect(result.current.error).toBe('No se pudieron cargar los clientes')
      expect(result.current.cargando).toBe(false)
    })
  })

  describe('agregarCliente', () => {
    it('agrega el cliente al inicio de la lista', async () => {
      vi.mocked(ClientesService.crear).mockResolvedValueOnce(mockCliente)

      const { result } = renderHook(() => useClientesStore())
      await act(async () => {
        await result.current.agregarCliente({ nombre: 'Juan Pérez', telefono: '3001234567' })
      })

      expect(result.current.clientes).toHaveLength(1)
      expect(result.current.clientes[0].id).toBe('c-1')
    })

    it('guarda mensaje de error si el service falla', async () => {
      vi.mocked(ClientesService.crear).mockRejectedValueOnce(new Error('Error'))

      const { result } = renderHook(() => useClientesStore())
      await act(async () => {
        await result.current.agregarCliente({ nombre: 'Juan', telefono: '300' })
      })

      expect(result.current.error).toBe('No se pudo guardar el cliente')
    })
  })

  describe('actualizarCliente', () => {
    it('reemplaza el cliente en la lista con la versión actualizada', async () => {
      const actualizado = { ...mockCliente, nombre: 'Juan Actualizado' }
      useClientesStore.setState({ clientes: [mockCliente] })
      vi.mocked(ClientesService.actualizar).mockResolvedValueOnce(actualizado)

      const { result } = renderHook(() => useClientesStore())
      await act(async () => {
        await result.current.actualizarCliente('c-1', { nombre: 'Juan Actualizado' })
      })

      expect(result.current.clientes[0].nombre).toBe('Juan Actualizado')
    })
  })

  describe('eliminarCliente', () => {
    it('remueve el cliente de la lista', async () => {
      useClientesStore.setState({ clientes: [mockCliente] })
      vi.mocked(ClientesService.eliminar).mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => useClientesStore())
      await act(async () => {
        await result.current.eliminarCliente('c-1')
      })

      expect(result.current.clientes).toHaveLength(0)
    })
  })
})
