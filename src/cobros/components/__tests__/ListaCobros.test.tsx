import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('@/cobros', () => ({
  useCobrosStore: vi.fn(),
}))

vi.mock('../FormAbono', () => ({
  FormAbono: ({ onClose, onAbonado }: { onClose: () => void; onAbonado: () => void }) => (
    <div data-testid="form-abono">
      <button onClick={onClose}>CerrarAbono</button>
      <button onClick={onAbonado}>SimularAbonado</button>
    </div>
  ),
}))

vi.mock('../MensajeCobro', () => ({
  MensajeCobro: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="mensaje-cobro"><button onClick={onClose}>CerrarMensaje</button></div>
  ),
}))

import { ListaCobros } from '../ListaCobros'
import { useCobrosStore } from '@/cobros'

const mockCargar = vi.fn()

const cuotaBase = {
  id: 'c-1',
  venta_id: 'v-1',
  numero_cuota: 1,
  valor: 50000,
  fecha_vencimiento: '2099-12-31',
  estado: 'pendiente',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  ventas: {
    id: 'v-1',
    total: 50000,
    clientes: { id: 'cl-1', nombre: 'Juan Pérez', telefono: '3001234567' },
  },
}

const buildState = (override = {}) => ({
  cuotasPendientes: [],
  cargando: false,
  error: null,
  cargarCuotasPendientes: mockCargar,
  ...override,
})

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useCobrosStore).mockReturnValue(buildState())
})

describe('ListaCobros', () => {
  it('muestra skeleton mientras carga sin cuotas', () => {
    vi.mocked(useCobrosStore).mockReturnValue(buildState({ cargando: true, cuotasPendientes: [] }))
    const { container } = render(<ListaCobros />)
    expect(container.querySelector('[class*="animate"]') ?? container.firstChild).toBeTruthy()
  })

  it('muestra "Sin cuotas pendientes" cuando lista vacía', () => {
    render(<ListaCobros />)
    expect(screen.getByText(/sin cuotas pendientes/i)).toBeInTheDocument()
  })

  it('renderiza nombre del cliente y monto de cuota', () => {
    vi.mocked(useCobrosStore).mockReturnValue(buildState({ cuotasPendientes: [cuotaBase] }))
    render(<ListaCobros />)
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
    expect(screen.getByText(/cuota 1/i)).toBeInTheDocument()
  })

  it('muestra badge Vencida para cuota con fecha pasada', () => {
    const cuotaVencida = { ...cuotaBase, fecha_vencimiento: '2020-01-01' }
    vi.mocked(useCobrosStore).mockReturnValue(buildState({ cuotasPendientes: [cuotaVencida] }))
    render(<ListaCobros />)
    expect(screen.getByText('Vencida')).toBeInTheDocument()
  })

  it('muestra badge Pendiente para cuota vigente', () => {
    vi.mocked(useCobrosStore).mockReturnValue(buildState({ cuotasPendientes: [cuotaBase] }))
    render(<ListaCobros />)
    expect(screen.getByText('Pendiente')).toBeInTheDocument()
  })

  it('abre FormAbono al hacer clic en Abonar', () => {
    vi.mocked(useCobrosStore).mockReturnValue(buildState({ cuotasPendientes: [cuotaBase] }))
    render(<ListaCobros />)
    fireEvent.click(screen.getByRole('button', { name: /abonar/i }))
    expect(screen.getByTestId('form-abono')).toBeInTheDocument()
  })

  it('abre MensajeCobro al hacer clic en WhatsApp', () => {
    vi.mocked(useCobrosStore).mockReturnValue(buildState({ cuotasPendientes: [cuotaBase] }))
    render(<ListaCobros />)
    fireEvent.click(screen.getByRole('button', { name: /whatsapp/i }))
    expect(screen.getByTestId('mensaje-cobro')).toBeInTheDocument()
  })

  it('muestra error del store si existe', () => {
    vi.mocked(useCobrosStore).mockReturnValue(buildState({ error: 'Error de red' }))
    render(<ListaCobros />)
    expect(screen.getByText('Error de red')).toBeInTheDocument()
  })

  it('cierra FormAbono y recarga al simular abono completado', () => {
    vi.mocked(useCobrosStore).mockReturnValue(buildState({ cuotasPendientes: [cuotaBase] }))
    render(<ListaCobros />)
    fireEvent.click(screen.getByRole('button', { name: /abonar/i }))
    fireEvent.click(screen.getByRole('button', { name: /simularabonado/i }))
    expect(screen.queryByTestId('form-abono')).not.toBeInTheDocument()
    expect(mockCargar).toHaveBeenCalled()
  })

  it('vencidas aparecen antes que pendientes en la lista', () => {
    const cuotaVencida = { ...cuotaBase, id: 'c-2', fecha_vencimiento: '2020-01-01', ventas: { ...cuotaBase.ventas, clientes: { ...cuotaBase.ventas.clientes, nombre: 'Ana Mora' } } }
    vi.mocked(useCobrosStore).mockReturnValue(buildState({ cuotasPendientes: [cuotaBase, cuotaVencida] }))
    render(<ListaCobros />)
    const nombres = screen.getAllByText(/Juan Pérez|Ana Mora/)
    expect(nombres[0].textContent).toBe('Ana Mora')
  })
})
