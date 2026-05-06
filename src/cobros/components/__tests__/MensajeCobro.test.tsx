import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

vi.mock('@/cobros', () => ({
  generarMensajeCobro: vi.fn(),
}))

import { MensajeCobro } from '../MensajeCobro'
import { generarMensajeCobro } from '@/cobros'

const cuota = {
  id: 'c-1',
  venta_id: 'v-1',
  numero_cuota: 1,
  valor: 50000,
  fecha_vencimiento: '2099-12-31',
  estado: 'pendiente' as const,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ventas: {
    id: 'v-1',
    total: 50000,
    notas: null,
    clientes: { id: 'cl-1', nombre: 'Carlos Ruiz', telefono: '3151234567' },
  },
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(generarMensajeCobro).mockReturnValue('Hola Carlos Ruiz, tienes 1 cuota(s) pendiente(s) por $500.')
  Object.assign(navigator, {
    clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
  })
})

describe('MensajeCobro', () => {
  it('renderiza nombre del cliente', () => {
    render(<MensajeCobro cuota={cuota} onClose={vi.fn()} />)
    expect(screen.getByText('Carlos Ruiz')).toBeInTheDocument()
  })

  it('muestra teléfono del cliente', () => {
    render(<MensajeCobro cuota={cuota} onClose={vi.fn()} />)
    expect(screen.getByText('3151234567')).toBeInTheDocument()
  })

  it('muestra el mensaje generado', () => {
    render(<MensajeCobro cuota={cuota} onClose={vi.fn()} />)
    expect(screen.getByText(/Hola Carlos Ruiz/)).toBeInTheDocument()
  })

  it('copia el mensaje al portapapeles', async () => {
    render(<MensajeCobro cuota={cuota} onClose={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /copiar/i }))
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        'Hola Carlos Ruiz, tienes 1 cuota(s) pendiente(s) por $500.'
      )
    })
  })

  it('tiene enlace de WhatsApp con número colombiano', () => {
    render(<MensajeCobro cuota={cuota} onClose={vi.fn()} />)
    const link = screen.getByRole('link', { name: /enviar/i })
    expect(link.getAttribute('href')).toContain('wa.me/573151234567')
  })
})
