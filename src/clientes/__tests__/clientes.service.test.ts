import { describe, it, expect, vi, beforeEach } from 'vitest'
import '@/test-utils/supabase.mock'
import { mockSupabase, mockQueryBuilder } from '@/test-utils/supabase.mock'
import { ClientesService } from '../clientes.service'

const mockCliente = {
  id: 'c-1',
  user_id: 'test-user-id',
  nombre: 'Juan Pérez',
  telefono: '3001234567',
  notas: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
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

describe('ClientesService', () => {
  describe('obtenerTodos', () => {
    it('llama a supabase.from("clientes").select', async () => {
      mockQueryBuilder.order.mockResolvedValueOnce({ data: [mockCliente], error: null })

      await ClientesService.obtenerTodos()

      expect(mockSupabase.from).toHaveBeenCalledWith('clientes')
      expect(mockQueryBuilder.select).toHaveBeenCalled()
    })
  })

  describe('crear', () => {
    it('llama a supabase.from("clientes").insert', async () => {
      mockQueryBuilder.single.mockResolvedValueOnce({ data: mockCliente, error: null })

      await ClientesService.crear({ nombre: 'Juan Pérez', telefono: '3001234567' })

      expect(mockSupabase.from).toHaveBeenCalledWith('clientes')
      expect(mockQueryBuilder.insert).toHaveBeenCalled()
    })

    it('lanza error si el usuario no está autenticado', async () => {
      mockSupabase.auth.getUser.mockResolvedValueOnce({
        data: { user: null },
        error: null,
      })

      await expect(
        ClientesService.crear({ nombre: 'Juan', telefono: '300' })
      ).rejects.toThrow('No autenticado')
    })
  })

  describe('actualizar', () => {
    it('llama a supabase.from("clientes").update', async () => {
      mockQueryBuilder.single.mockResolvedValueOnce({ data: mockCliente, error: null })

      await ClientesService.actualizar('c-1', { nombre: 'Juan Actualizado' })

      expect(mockSupabase.from).toHaveBeenCalledWith('clientes')
      expect(mockQueryBuilder.update).toHaveBeenCalled()
    })
  })

  describe('eliminar', () => {
    it('llama a supabase.from("clientes").delete', async () => {
      await ClientesService.eliminar('c-1')

      expect(mockSupabase.from).toHaveBeenCalledWith('clientes')
      expect(mockQueryBuilder.delete).toHaveBeenCalled()
    })
  })
})
