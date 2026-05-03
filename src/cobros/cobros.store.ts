import { create } from 'zustand'
import { CobrosService } from './cobros.service'
import type { CuotaConCliente, Abono, CrearAbono } from './cobros.types'

interface CobrosState {
  cuotasPendientes: CuotaConCliente[]
  abonos: Record<string, Abono[]>
  cargando: boolean
  error: string | null

  cargarCuotasPendientes: () => Promise<void>
  registrarAbono: (datos: CrearAbono) => Promise<void>
  cargarAbonos: (cuotaId: string) => Promise<void>
}

export const useCobrosStore = create<CobrosState>((set, get) => ({
  cuotasPendientes: [],
  abonos: {},
  cargando: false,
  error: null,

  cargarCuotasPendientes: async () => {
    set({ cargando: true, error: null })
    try {
      const datos = await CobrosService.obtenerCuotasPendientes()
      set({ cuotasPendientes: datos, cargando: false })
    } catch (e) {
      set({ error: 'No se pudieron cargar las cuotas', cargando: false })
    }
  },

  registrarAbono: async (datos) => {
    set({ cargando: true, error: null })
    try {
      await CobrosService.registrarAbono(datos)
      await get().cargarCuotasPendientes()
      await get().cargarAbonos(datos.cuotaId)
      set({ cargando: false })
    } catch (e) {
      set({ error: 'No se pudo registrar el abono', cargando: false })
    }
  },

  cargarAbonos: async (cuotaId: string) => {
    try {
      const datos = await CobrosService.obtenerAbonosPorCuota(cuotaId)
      set(state => ({
        abonos: { ...state.abonos, [cuotaId]: datos }
      }))
    } catch (e) {
      set({ error: 'No se pudieron cargar los abonos' })
    }
  },
}))