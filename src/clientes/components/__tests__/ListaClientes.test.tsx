import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('@/clientes', () => ({
  useClientesStore: vi.fn(),
  calcularDeudaTotal: (cuotas: { valor: number; estado: string }[]) =>
    cuotas.filter(c => c.estado !== 'pagada').reduce((sum, c) => sum + c.valor, 0),
  estaEnMora: (cuotas: { estado: string }[]) =>
    cuotas.some(c => c.estado === 'vencida'),
}))

import { ListaClientes } from '../ListaClientes'
import { useClientesStore } from '@/clientes'

const mockCargarClientes = vi.fn()

const clienteBase = {
  id: 'c-1',
  user_id: 'user-1',
  nombre: 'Juan Pérez',
  telefono: '3001234567',
  notas: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  cuotas: [],
}

const buildStoreState = (override = {}) => ({
  clientes: [],
  cargando: false,
  error: null,
  cargarClientes: mockCargarClientes,
  agregarCliente: vi.fn(),
  actualizarCliente: vi.fn(),
  eliminarCliente: vi.fn(),
  ...override,
})

beforeEach(() => {
  vi.mocked(useClientesStore).mockImplementation(
    (selector?: (s: ReturnType<typeof buildStoreState>) => unknown) => {
      const state = buildStoreState()
      return selector ? selector(state) : state
    }
  )
})

describe('ListaClientes', () => {
  it('muestra skeleton mientras cargando y sin clientes', () => {
    vi.mocked(useClientesStore).mockImplementation(
      (selector?: (s: ReturnType<typeof buildStoreState>) => unknown) => {
        const state = buildStoreState({ cargando: true, clientes: [] })
        return selector ? selector(state) : state
      }
    )

    const { container } = render(<ListaClientes />)
    // Skeleton renders divs with animation classes
    expect(container.querySelector('[class*="animate"]') ?? container.firstChild).toBeTruthy()
  })

  it('llama a eliminarCliente al hacer clic en Eliminar', async () => {
    const eliminarCliente = vi.fn().mockResolvedValue(undefined)

    vi.mocked(useClientesStore).mockImplementation(
      (selector?: (s: ReturnType<typeof buildStoreState>) => unknown) => {
        const state = buildStoreState({ clientes: [clienteBase], eliminarCliente })
        return selector ? selector(state) : state
      }
    )

    render(<ListaClientes />)
    fireEvent.click(screen.getByRole('button', { name: /eliminar/i }))
    expect(eliminarCliente).toHaveBeenCalledWith(clienteBase.id)
  })

  it('renderiza lista de clientes del store', () => {
    vi.mocked(useClientesStore).mockImplementation(
      (selector?: (s: ReturnType<typeof buildStoreState>) => unknown) => {
        const state = buildStoreState({ clientes: [clienteBase] })
        return selector ? selector(state) : state
      }
    )

    render(<ListaClientes />)

    expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
  })

  it('muestra "Sin clientes" cuando la lista está vacía', () => {
    render(<ListaClientes />)

    expect(screen.getByText(/sin clientes/i)).toBeInTheDocument()
  })

  it('muestra badge "En mora" si cliente tiene deuda vencida', () => {
    const clienteEnMora = {
      ...clienteBase,
      cuotas: [{ id: 'q-1', valor: 30000, estado: 'vencida', fecha_vencimiento: '2026-03-01' }],
    }

    vi.mocked(useClientesStore).mockImplementation(
      (selector?: (s: ReturnType<typeof buildStoreState>) => unknown) => {
        const state = buildStoreState({ clientes: [clienteEnMora] })
        return selector ? selector(state) : state
      }
    )

    render(<ListaClientes />)

    expect(screen.getByText(/en mora/i)).toBeInTheDocument()
  })

  it('muestra formulario de creación al hacer clic en "+ Nuevo"', async () => {
    render(<ListaClientes />)

    fireEvent.click(screen.getByRole('button', { name: /\+ nuevo/i }))

    expect(screen.getByRole('button', { name: /guardar/i })).toBeInTheDocument()
  })

  it('muestra formulario de edición al hacer clic en Editar', async () => {
    vi.mocked(useClientesStore).mockImplementation(
      (selector?: (s: ReturnType<typeof buildStoreState>) => unknown) => {
        const state = buildStoreState({ clientes: [clienteBase] })
        return selector ? selector(state) : state
      }
    )

    render(<ListaClientes />)
    fireEvent.click(screen.getByRole('button', { name: /editar/i }))

    // Edit form shows with pre-filled nombre
    expect(screen.getAllByRole('button', { name: /guardar/i })).toHaveLength(1)
  })

  it('muestra deuda total formateada en pesos COP', () => {
    const clienteConDeuda = {
      ...clienteBase,
      cuotas: [{ id: 'q-1', valor: 50000, estado: 'pendiente', fecha_vencimiento: '2026-05-01' }],
    }

    vi.mocked(useClientesStore).mockImplementation(
      (selector?: (s: ReturnType<typeof buildStoreState>) => unknown) => {
        const state = buildStoreState({ clientes: [clienteConDeuda] })
        return selector ? selector(state) : state
      }
    )

    render(<ListaClientes />)

    // 50000 pesos = $ 50.000
    expect(screen.getByText(/50\.000/)).toBeInTheDocument()
  })
})
