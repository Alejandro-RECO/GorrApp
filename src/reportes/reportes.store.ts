import { create } from 'zustand'
import { ReportesService } from './reportes.service'
import type { ResumenGeneral, ProductoInventario } from './reportes.types'
import type { Venta } from '@/ventas'
import type { CuotaConCliente } from '@/cobros'

interface ReportesState {
  resumen: ResumenGeneral | null
  ventasPeriodo: Venta[]
  carteraPendiente: CuotaConCliente[]
  detalleInventario: ProductoInventario[]
  cargando: boolean
  error: string | null

  cargarResumen: () => Promise<void>
  cargarVentasPeriodo: (desde: string, hasta: string) => Promise<void>
  cargarCarteraPendiente: () => Promise<void>
  cargarDetalleInventario: () => Promise<void>
}

export const useReportesStore = create<ReportesState>((set) => ({
  resumen: null,
  ventasPeriodo: [],
  carteraPendiente: [],
  detalleInventario: [],
  cargando: false,
  error: null,

  cargarResumen: async () => {
    set({ cargando: true, error: null })
    try {
      const datos = await ReportesService.obtenerResumenGeneral()
      set({ resumen: datos, cargando: false })
    } catch {
      set({ error: 'No se pudo cargar el resumen', cargando: false })
    }
  },

  cargarVentasPeriodo: async (desde, hasta) => {
    set({ cargando: true, error: null })
    try {
      const datos = await ReportesService.obtenerVentasPeriodo(desde, hasta)
      set({ ventasPeriodo: datos, cargando: false })
    } catch {
      set({ error: 'No se pudieron cargar las ventas', cargando: false })
    }
  },

  cargarCarteraPendiente: async () => {
    set({ cargando: true, error: null })
    try {
      const datos = await ReportesService.obtenerCarteraPendiente()
      set({ carteraPendiente: datos, cargando: false })
    } catch {
      set({ error: 'No se pudo cargar la cartera', cargando: false })
    }
  },

  cargarDetalleInventario: async () => {
    set({ cargando: true, error: null })
    try {
      const datos = await ReportesService.obtenerDetalleInventario()
      set({ detalleInventario: datos, cargando: false })
    } catch {
      set({ error: 'No se pudo cargar el inventario', cargando: false })
    }
  },
}))
