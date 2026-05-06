import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

vi.mock('@/cobros', () => ({
  useCobrosStore: vi.fn(),
  calcularSaldoPendiente: vi.fn(),
}))

import { FormAbono } from '../FormAbono'
import { useCobrosStore, calcularSaldoPendiente } from '@/cobros'

const mockRegistrarAbono = vi.fn()
const mockCargarAbonos = vi.fn()

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
    clientes: { id: 'cl-1', nombre: 'María López', telefono: '3009876543' },
  },
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useCobrosStore).mockReturnValue({
    registrarAbono: mockRegistrarAbono,
    cargarAbonos: mockCargarAbonos,
    abonos: {},
    cargando: false,
    error: null,
  })
  vi.mocked(calcularSaldoPendiente).mockReturnValue(50000)
})

describe('FormAbono', () => {
  it('renderiza nombre del cliente en descripción', () => {
    render(<FormAbono cuota={cuota} onClose={vi.fn()} onAbonado={vi.fn()} />)
    expect(screen.getByText(/María López/i)).toBeInTheDocument()
  })

  it('botón Guardar deshabilitado cuando valor es 0', () => {
    render(<FormAbono cuota={cuota} onClose={vi.fn()} onAbonado={vi.fn()} />)
    const btn = screen.getByRole('button', { name: /guardar/i })
    expect(btn).toBeDisabled()
  })

  it('muestra error cuando valor excede saldo pendiente', () => {
    render(<FormAbono cuota={cuota} onClose={vi.fn()} onAbonado={vi.fn()} />)
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '99999' } })
    expect(screen.getByText(/no puede exceder/i)).toBeInTheDocument()
  })

  it('llama a registrarAbono y onAbonado con submit válido', async () => {
    mockRegistrarAbono.mockResolvedValue(undefined)
    const onAbonado = vi.fn()
    render(<FormAbono cuota={cuota} onClose={vi.fn()} onAbonado={onAbonado} />)

    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '25000' } })
    fireEvent.click(screen.getByRole('button', { name: /guardar/i }))

    await waitFor(() => {
      expect(mockRegistrarAbono).toHaveBeenCalledWith({
        cuotaId: 'c-1',
        valor: 25000,
        medioPago: 'efectivo',
      })
      expect(onAbonado).toHaveBeenCalled()
    })
  })

  it('llama a onClose al cancelar', () => {
    const onClose = vi.fn()
    render(<FormAbono cuota={cuota} onClose={onClose} onAbonado={vi.fn()} />)
    fireEvent.click(screen.getByRole('button', { name: /cancelar/i }))
    expect(onClose).toHaveBeenCalled()
  })
})
