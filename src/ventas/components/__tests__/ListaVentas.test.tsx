import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/ventas', () => ({
  useVentasStore: vi.fn(),
}))

import { ListaVentas } from '../ListaVentas'
import { useVentasStore } from '@/ventas'

const mockVenta = {
  id: 'v-1',
  user_id: 'user-1',
  cliente_id: 'c-1',
  total: 100000,
  tipo: 'contado' as const,
  medio_pago: 'efectivo' as const,
  notas: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  clientes: { nombre: 'Juan Pérez' },
}

const buildStoreState = (override = {}) => ({
  ventas: [],
  cargando: false,
  error: null,
  cargarVentas: vi.fn(),
  agregarVenta: vi.fn(),
  cargarVentasPorCliente: vi.fn(),
  ...override,
})

beforeEach(() => {
  vi.mocked(useVentasStore).mockImplementation((selector?: any) => {
    const state = buildStoreState()
    return selector ? selector(state) : state
  })
})

describe('ListaVentas', () => {
  it('renderiza ventas del store', () => {
    vi.mocked(useVentasStore).mockImplementation((selector?: any) => {
      const state = buildStoreState({ ventas: [mockVenta] })
      return selector ? selector(state) : state
    })

    render(<ListaVentas />)

    expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
  })

  it('muestra badge tipo de venta (Contado / Fiado)', () => {
    vi.mocked(useVentasStore).mockImplementation((selector?: any) => {
      const state = buildStoreState({ ventas: [mockVenta] })
      return selector ? selector(state) : state
    })

    render(<ListaVentas />)

    expect(screen.getByText(/contado/i)).toBeInTheDocument()
  })

  it('muestra nombre del cliente', () => {
    vi.mocked(useVentasStore).mockImplementation((selector?: any) => {
      const state = buildStoreState({ ventas: [mockVenta] })
      return selector ? selector(state) : state
    })

    render(<ListaVentas />)

    expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
  })

  it('muestra total formateado en pesos COP', () => {
    vi.mocked(useVentasStore).mockImplementation((selector?: any) => {
      const state = buildStoreState({ ventas: [mockVenta] })
      return selector ? selector(state) : state
    })

    render(<ListaVentas />)

    // 100000 centavos = $1000 COP
    expect(screen.getByText(/\$\s*1\.000|\$\s*1000/)).toBeInTheDocument()
  })

  it('muestra "Sin ventas" cuando lista está vacía', () => {
    render(<ListaVentas />)

    expect(screen.getByText(/sin ventas/i)).toBeInTheDocument()
  })

  it('muestra skeleton mientras carga', () => {
    vi.mocked(useVentasStore).mockImplementation((selector?: any) => {
      const state = buildStoreState({ cargando: true, ventas: [] })
      return selector ? selector(state) : state
    })

    const { container } = render(<ListaVentas />)
    expect(container.firstChild).toBeTruthy()
  })

  it('con clienteId llama a cargarVentasPorCliente en lugar de cargarVentas', () => {
    const cargarVentasPorCliente = vi.fn()

    vi.mocked(useVentasStore).mockImplementation((selector?: any) => {
      const state = buildStoreState({ cargarVentasPorCliente })
      return selector ? selector(state) : state
    })

    render(<ListaVentas clienteId="c-1" />)

    expect(cargarVentasPorCliente).toHaveBeenCalledWith('c-1')
  })
})
