import { create } from 'zustand'
import { AuthService } from './auth.service'
import { supabase } from '@/shared/lib/supabase'
import type { AuthState } from './auth.types'

export const useAuthStore = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  negocio: null,
  cargando: false,

  loginConGoogle: async () => {
    set({ cargando: true })
    try {
      await AuthService.loginConGoogle()
    } finally {
      set({ cargando: false })
    }
  },

  cerrarSesion: async () => {
    set({ cargando: true })
    try {
      await AuthService.cerrarSesion()
      set({ session: null, profile: null, negocio: null })
    } finally {
      set({ cargando: false })
    }
  },

  cargarPerfil: async () => {
    const { profile, negocio } = await AuthService.cargarPerfil()
    set({ profile, negocio })
  },

  inicializarSesion: async () => {
    const sesion = await AuthService.obtenerSesionActiva()
    set({ session: sesion })
    if (sesion) {
      await get().cargarPerfil()
    }

    supabase.auth.onAuthStateChange(async (_event, sesion) => {
      set({ session: sesion })
      if (sesion) {
        await get().cargarPerfil()
      } else {
        set({ profile: null, negocio: null })
      }
    })
  },
}))
