import { create } from 'zustand'
import { ClientesService } from './clientes.service'
import type { Cliente, CrearCliente, ActualizarCliente } from './clientes.types'

interface ClientesState {
  clientes: Cliente[]
  cargando: boolean
  error: string | null
  cargarClientes: () => Promise<void>
  agregarCliente: (datos: CrearCliente) => Promise<void>
  actualizarCliente: (id: string, datos: ActualizarCliente) => Promise<void>
  eliminarCliente: (id: string) => Promise<void>
}

export const useClientesStore = create<ClientesState>((set) => ({
  clientes: [],
  cargando: false,
  error: null,

  cargarClientes: async () => {
    set({ cargando: true, error: null })
    try {
      const clientes = await ClientesService.obtenerTodos()
      set({ clientes, cargando: false })
    } catch {
      set({ error: 'No se pudieron cargar los clientes', cargando: false })
    }
  },

  agregarCliente: async (datos) => {
    set({ cargando: true, error: null })
    try {
      const nuevo = await ClientesService.crear(datos)
      set(state => ({ clientes: [nuevo, ...state.clientes], cargando: false }))
    } catch {
      set({ error: 'No se pudo guardar el cliente', cargando: false })
    }
  },

  actualizarCliente: async (id, datos) => {
    set({ cargando: true, error: null })
    try {
      const actualizado = await ClientesService.actualizar(id, datos)
      set(state => ({
        clientes: state.clientes.map(c => (c.id === id ? actualizado : c)),
        cargando: false,
      }))
    } catch {
      set({ error: 'No se pudo actualizar el cliente', cargando: false })
    }
  },

  eliminarCliente: async (id) => {
    set({ cargando: true, error: null })
    try {
      await ClientesService.eliminar(id)
      set(state => ({
        clientes: state.clientes.filter(c => c.id !== id),
        cargando: false,
      }))
    } catch {
      set({ error: 'No se pudo eliminar el cliente', cargando: false })
    }
  },
}))
