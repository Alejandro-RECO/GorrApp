import { create } from 'zustand'
import type { Notificacion, TipoNotificacion } from './notificaciones.types'

const MAX_NOTIFICACIONES = 50

interface NotificacionesState {
  notificaciones: Notificacion[]
  noLeidas: number

  agregarNotificacion: (n: { tipo: TipoNotificacion; mensaje: string }) => void
  marcarTodasLeidas: () => void
  limpiar: () => void
}

export const useNotificacionesStore = create<NotificacionesState>((set, get) => ({
  notificaciones: [],
  noLeidas: 0,

  agregarNotificacion: ({ tipo, mensaje }) => {
    const nueva: Notificacion = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      tipo,
      mensaje,
      leida: false,
      created_at: new Date().toISOString(),
    }
    const actuales = get().notificaciones
    const nuevas = [nueva, ...actuales].slice(0, MAX_NOTIFICACIONES)
    set({ notificaciones: nuevas, noLeidas: get().noLeidas + 1 })
  },

  marcarTodasLeidas: () => {
    set(state => ({
      notificaciones: state.notificaciones.map(n => ({ ...n, leida: true })),
      noLeidas: 0,
    }))
  },

  limpiar: () => set({ notificaciones: [], noLeidas: 0 }),
}))
