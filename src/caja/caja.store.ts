import { create } from 'zustand'
import { CajaService } from './caja.service'
import { calcularSaldoDia, calcularSaldoPorMedio } from './caja.utils'
import type { MovimientoCaja, CrearMovimiento, ResumenCaja } from './caja.types'

interface CajaState {
  movimientos: MovimientoCaja[]
  resumen: ResumenCaja
  fechaActiva: string
  cargando: boolean
  error: string | null

  cargarMovimientosDia: (fecha?: string) => Promise<void>
  registrarMovimiento: (datos: CrearMovimiento) => Promise<void>
}

export const useCajaStore = create<CajaState>((set, get) => ({
  movimientos: [],
  resumen: { efectivo: 0, digital: 0, total: 0 },
  fechaActiva: new Date().toISOString().split('T')[0],
  cargando: false,
  error: null,

  cargarMovimientosDia: async (fecha) => {
    const fechaFiltro = fecha ?? get().fechaActiva
    set({ cargando: true, error: null })
    try {
      const datos = await CajaService.obtenerMovimientosDia(fechaFiltro)
      set({
        movimientos: datos,
        resumen: {
          efectivo: calcularSaldoPorMedio(datos, 'efectivo'),
          digital: calcularSaldoPorMedio(datos, 'digital'),
          total: calcularSaldoDia(datos),
        },
        fechaActiva: fechaFiltro,
        cargando: false,
      })
    } catch {
      set({ error: 'No se pudieron cargar los movimientos', cargando: false })
    }
  },

  registrarMovimiento: async (datos) => {
    set({ cargando: true, error: null })
    try {
      await CajaService.registrarMovimiento(datos)
      await get().cargarMovimientosDia(get().fechaActiva)
      set({ cargando: false })
    } catch {
      set({ error: 'No se pudo registrar el movimiento', cargando: false })
    }
  },
}))
