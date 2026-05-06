import { create } from 'zustand'
import { AuthService } from './auth.service'
import { supabase } from '@/shared/lib/supabase'
import type { AuthState } from './auth.types'

// Módulo scope — permite limpiar listener antes de registrar uno nuevo
let _authSubscription: { unsubscribe: () => void } | null = null

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
    try {
      const { profile, negocio } = await AuthService.cargarPerfil()
      set({ profile, negocio })
    } catch {
      set({ profile: null, negocio: null })
    }
  },

  inicializarSesion: async () => {
    // Limpiar listener previo antes de crear uno nuevo (evita acumulación)
    _authSubscription?.unsubscribe()
    _authSubscription = null

    set({ cargando: true })
    try {
      const sesion = await AuthService.obtenerSesionActiva()
      set({ session: sesion })
      if (sesion) {
        await get().cargarPerfil()
      }
    } finally {
      set({ cargando: false })
    }

    // Registrar listener solo para cambios POSTERIORES al arranque inicial.
    // INITIAL_SESSION se ignora — ya fue manejado arriba.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, sesion) => {
      if (event === 'INITIAL_SESSION') return
      if (event === 'TOKEN_REFRESHED') {
        // JWT renovado — el profile y negocio no cambian, solo actualizar sesión
        set({ session: sesion })
        return
      }
      set({ session: sesion })
      if (sesion) {
        await get().cargarPerfil()
      } else {
        set({ profile: null, negocio: null })
      }
    })
    _authSubscription = subscription
  },
}))
