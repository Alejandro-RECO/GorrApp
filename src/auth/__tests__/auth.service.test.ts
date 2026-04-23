import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mockAuth } from '@/test-utils/supabase.mock'

import { AuthService } from '../auth.service'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('AuthService', () => {
  describe('loginConGoogle', () => {
    it('llama a signInWithOAuth con provider google', async () => {
      mockAuth.signInWithOAuth.mockResolvedValueOnce({ data: {}, error: null })

      await AuthService.loginConGoogle()

      expect(mockAuth.signInWithOAuth).toHaveBeenCalledWith({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      })
    })

    it('lanza error si Supabase falla', async () => {
      mockAuth.signInWithOAuth.mockResolvedValueOnce({
        data: null,
        error: { message: 'OAuth error' },
      })

      await expect(AuthService.loginConGoogle()).rejects.toThrow('OAuth error')
    })
  })

  describe('cerrarSesion', () => {
    it('llama a signOut', async () => {
      mockAuth.signOut.mockResolvedValueOnce({ error: null })

      await AuthService.cerrarSesion()

      expect(mockAuth.signOut).toHaveBeenCalledOnce()
    })

    it('lanza error si signOut falla', async () => {
      mockAuth.signOut.mockResolvedValueOnce({ error: { message: 'signOut error' } })

      await expect(AuthService.cerrarSesion()).rejects.toThrow('signOut error')
    })
  })

  describe('obtenerSesionActiva', () => {
    it('retorna la sesion cuando existe', async () => {
      const sesionMock = { user: { id: 'user-1' }, access_token: 'token' }
      mockAuth.getSession.mockResolvedValueOnce({
        data: { session: sesionMock },
        error: null,
      })

      const sesion = await AuthService.obtenerSesionActiva()

      expect(sesion).toEqual(sesionMock)
    })

    it('retorna null cuando no hay sesion activa', async () => {
      mockAuth.getSession.mockResolvedValueOnce({
        data: { session: null },
        error: null,
      })

      const sesion = await AuthService.obtenerSesionActiva()

      expect(sesion).toBeNull()
    })
  })
})
