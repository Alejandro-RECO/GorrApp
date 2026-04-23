import { create } from 'zustand'
import { AuthService } from './auth.service'
import { supabase } from '@/shared/lib/supabase'
import type { AuthState } from './auth.types'

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
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
      set({ session: null })
    } finally {
      set({ cargando: false })
    }
  },

  inicializarSesion: async () => {
    const sesion = await AuthService.obtenerSesionActiva()
    set({ session: sesion })

    supabase.auth.onAuthStateChange((_event, sesion) => {
      set({ session: sesion })
    })
  },
}))
