import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@/test-utils/supabase.mock'

import { LoginPage } from '../LoginPage'
import { useAuthStore } from '@/auth'

vi.mock('@/auth', async (importOriginal) => {
  const original = await importOriginal<typeof import('@/auth')>()
  return {
    ...original,
    useAuthStore: vi.fn(),
  }
})

const mockLoginConGoogle = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useAuthStore).mockReturnValue({
    session: null,
    cargando: false,
    loginConGoogle: mockLoginConGoogle,
    cerrarSesion: vi.fn(),
    inicializarSesion: vi.fn(),
  })
})

describe('LoginPage', () => {
  describe('cuando carga la página', () => {
    it('renderiza botón Ingresar con Google', () => {
      render(<LoginPage />)
      expect(
        screen.getByRole('button', { name: /ingresar con google/i })
      ).toBeInTheDocument()
    })
  })

  describe('cuando el usuario hace click en el botón', () => {
    it('llama a loginConGoogle del store', () => {
      render(<LoginPage />)
      fireEvent.click(screen.getByRole('button', { name: /ingresar con google/i }))
      expect(mockLoginConGoogle).toHaveBeenCalledOnce()
    })
  })

  describe('cuando cargando es true', () => {
    it('muestra skeleton y deshabilita el botón', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        session: null,
        cargando: true,
        loginConGoogle: mockLoginConGoogle,
        cerrarSesion: vi.fn(),
        inicializarSesion: vi.fn(),
      })

      render(<LoginPage />)

      const boton = screen.getByRole('button', { name: /ingresar con google/i })
      expect(boton).toBeDisabled()
    })
  })
})
