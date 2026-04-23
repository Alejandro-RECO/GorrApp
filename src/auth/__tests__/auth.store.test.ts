import { describe, it, expect, beforeEach, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import '@/test-utils/supabase.mock'

vi.mock('../auth.service', () => ({
  AuthService: {
    loginConGoogle: vi.fn(),
    cerrarSesion: vi.fn(),
    obtenerSesionActiva: vi.fn(),
  },
}))

import { useAuthStore } from '../auth.store'
import { AuthService } from '../auth.service'

const resetStore = () =>
  useAuthStore.setState({ session: null, cargando: false })

beforeEach(() => {
  vi.clearAllMocks()
  resetStore()
})

describe('useAuthStore', () => {
  describe('loginConGoogle', () => {
    it('llama a AuthService.loginConGoogle', async () => {
      vi.mocked(AuthService.loginConGoogle).mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => useAuthStore())
      await act(async () => {
        await result.current.loginConGoogle()
      })

      expect(AuthService.loginConGoogle).toHaveBeenCalledOnce()
    })

    it('resetea cargando a false aunque falle', async () => {
      vi.mocked(AuthService.loginConGoogle).mockRejectedValueOnce(
        new Error('fallo')
      )

      const { result } = renderHook(() => useAuthStore())
      await act(async () => {
        await result.current.loginConGoogle().catch(() => {})
      })

      expect(result.current.cargando).toBe(false)
    })
  })

  describe('cerrarSesion', () => {
    it('limpia la sesion del store', async () => {
      useAuthStore.setState({ session: { user: { id: 'u1' } } as never })
      vi.mocked(AuthService.cerrarSesion).mockResolvedValueOnce(undefined)

      const { result } = renderHook(() => useAuthStore())
      await act(async () => {
        await result.current.cerrarSesion()
      })

      expect(result.current.session).toBeNull()
    })
  })

  describe('inicializarSesion', () => {
    it('carga la sesion activa desde el service', async () => {
      const sesionMock = { user: { id: 'u1' }, access_token: 'tok' } as never
      vi.mocked(AuthService.obtenerSesionActiva).mockResolvedValueOnce(sesionMock)

      const { result } = renderHook(() => useAuthStore())
      await act(async () => {
        await result.current.inicializarSesion()
      })

      expect(result.current.session).toEqual(sesionMock)
    })
  })
})
