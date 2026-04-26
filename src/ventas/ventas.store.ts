import { create } from 'zustand'
import { VentasService } from './ventas.service'
import type { CrearVenta, VentaConCliente } from './ventas.types'

interface VentasState {
  ventas: VentaConCliente[]
  cargando: boolean
  error: string | null
  cargarVentas: () => Promise<void>
  agregarVenta: (datos: CrearVenta) => Promise<void>
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
      await VentasService.crear(datos)
      const ventas = await VentasService.obtenerTodos()
      set({ ventas, cargando: false })
    } catch {
      set({ error: 'No se pudo registrar la venta', cargando: false })
    }
  },
}))
