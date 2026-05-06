import { create } from 'zustand'
import { NegocioService } from './negocio.service'
import type { Invitacion, Miembro } from './negocio.types'

interface NegocioState {
  miembros: Miembro[]
  invitaciones: Invitacion[]
  cargando: boolean
  error: string | null

  cargarMiembros: () => Promise<void>
  cargarInvitaciones: () => Promise<void>
  generarInvitacion: () => Promise<Invitacion>
  actualizarNombre: (nombre: string) => Promise<void>
}

export const useNegocioStore = create<NegocioState>((set) => ({
  miembros: [],
  invitaciones: [],
  cargando: false,
  error: null,

  cargarMiembros: async () => {
    set({ cargando: true, error: null })
    try {
      const datos = await NegocioService.obtenerMiembros()
      set({ miembros: datos, cargando: false })
    } catch {
      set({ error: 'No se pudieron cargar los miembros', cargando: false })
    }
  },

  cargarInvitaciones: async () => {
    set({ cargando: true, error: null })
    try {
      const datos = await NegocioService.obtenerInvitacionesActivas()
      set({ invitaciones: datos, cargando: false })
    } catch {
      set({ error: 'No se pudieron cargar las invitaciones', cargando: false })
    }
  },

  generarInvitacion: async () => {
    set({ cargando: true, error: null })
    try {
      const inv = await NegocioService.generarCodigoInvitacion()
      set(state => ({ invitaciones: [inv, ...state.invitaciones], cargando: false }))
      return inv
    } catch {
      set({ error: 'No se pudo generar la invitación', cargando: false })
      throw new Error('No se pudo generar la invitación')
    }
  },

  actualizarNombre: async (nombre) => {
    set({ cargando: true, error: null })
    try {
      await NegocioService.actualizarNombreNegocio(nombre)
      set({ cargando: false })
    } catch {
      set({ error: 'No se pudo actualizar el nombre', cargando: false })
    }
  },
}))
