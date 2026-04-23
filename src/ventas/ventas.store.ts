import { create } from 'zustand'
import { VentasService } from './ventas.service'
import type { Venta, CrearVenta } from './ventas.types'

interface VentasState {
  ventas: Venta[]
  cargando: boolean
  error: string | null
  cargarVentas: () => Promise<void>
  agregarVenta: (datos: CrearVenta) => Promise<void>
  cargarVentasPorCliente: (clienteId: string) => Promise<void>
}

export const useVentasStore = create<VentasState>((set) => ({
  ventas: [],
  cargando: false,
  error: null,

  cargarVentas: async () => {
    set({ cargando: true, error: null })
    try {
      const ventas = await VentasService.obtenerTodos()
      set({ ventas, cargando: false })
    } catch {
      set({ error: 'No se pudieron cargar las ventas', cargando: false })
    }
  },

  agregarVenta: async (datos) => {
    set({ cargando: true, error: null })
    try {
      const nueva = await VentasService.crear(datos)
      set(state => ({ ventas: [nueva, ...state.ventas], cargando: false }))
    } catch {
      set({ error: 'No se pudo registrar la venta', cargando: false })
    }
  },

  cargarVentasPorCliente: async (clienteId) => {
    set({ cargando: true, error: null })
    try {
      const ventas = await VentasService.obtenerPorCliente(clienteId)
      set({ ventas, cargando: false })
    } catch {
      set({ error: 'No se pudieron cargar las ventas del cliente', cargando: false })
    }
  },
}))
