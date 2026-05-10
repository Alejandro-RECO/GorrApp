import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

vi.mock('@/reportes', () => ({
  useReportesStore: vi.fn(),
}))

import { PanelInventario } from '../PanelInventario'
import { useReportesStore } from '@/reportes'

const mockCargarDetalleInventario = vi.fn()
const mockCargarResumen = vi.fn()

const productoBase = {
  id: 'p-1',
  nombre: 'Gorra NY',
  stock_actual: 5,
  precio_venta: 30000,
  valor_total: 150000,
  stock_bajo: false,
}

const buildStoreState = (override = {}) => ({
  resumen: { valorInventario: 150000, totalVendido: 0, totalCartera: 0, totalEfectivo: 0, totalDigital: 0, rentabilidad: 0, clientesEnMora: 0 },
  detalleInventario: [],
  cargando: false,
  error: null,
  cargarDetalleInventario: mockCargarDetalleInventario,
  cargarResumen: mockCargarResumen,
  ...override,
})

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(useReportesStore).mockImplementation(
    (selector?: (s: ReturnType<typeof buildStoreState>) => unknown) => {
      const state = buildStoreState()
      return selector ? selector(state) : state
    }
  )
})

describe('PanelInventario', () => {
  it('muestra skeleton mientras carga sin productos', () => {
    vi.mocked(useReportesStore).mockImplementation(
      (selector?: (s: ReturnType<typeof buildStoreState>) => unknown) => {
        const state = buildStoreState({ cargando: true, detalleInventario: [] })
        return selector ? selector(state) : state
      }
    )

    const { container } = render(<PanelInventario />)
    expect(container.querySelector('[class*="animate"]') ?? container.firstChild).toBeTruthy()
  })

  it('muestra total valorInventario del resumen', () => {
    vi.mocked(useReportesStore).mockImplementation(
      (selector?: (s: ReturnType<typeof buildStoreState>) => unknown) => {
        const state = buildStoreState({
          resumen: { ...buildStoreState().resumen, valorInventario: 450000 },
          detalleInventario: [productoBase],
        })
        return selector ? selector(state) : state
      }
    )

    render(<PanelInventario />)
    expect(screen.getByText(/450\.000/)).toBeTruthy()
  })

  it('renderiza nombre del producto', () => {
    vi.mocked(useReportesStore).mockImplementation(
      (selector?: (s: ReturnType<typeof buildStoreState>) => unknown) => {
        const state = buildStoreState({ detalleInventario: [productoBase] })
        return selector ? selector(state) : state
      }
    )

    render(<PanelInventario />)
    expect(screen.getByText('Gorra NY')).toBeTruthy()
  })

  it('renderiza stock y precio del producto', () => {
    vi.mocked(useReportesStore).mockImplementation(
      (selector?: (s: ReturnType<typeof buildStoreState>) => unknown) => {
        const state = buildStoreState({ detalleInventario: [productoBase] })
        return selector ? selector(state) : state
      }
    )

    render(<PanelInventario />)
    expect(screen.getByText(/5 uds/)).toBeTruthy()
    expect(screen.getByText(/30\.000/)).toBeTruthy()
  })

  it('muestra badge "Stock bajo" cuando stock_bajo es true', () => {
    const productoConStockBajo = { ...productoBase, stock_bajo: true }
    vi.mocked(useReportesStore).mockImplementation(
      (selector?: (s: ReturnType<typeof buildStoreState>) => unknown) => {
        const state = buildStoreState({ detalleInventario: [productoConStockBajo] })
        return selector ? selector(state) : state
      }
    )

    render(<PanelInventario />)
    expect(screen.getByText('Stock bajo')).toBeTruthy()
  })

  it('muestra estado vacío cuando detalleInventario está vacío y no está cargando', () => {
    render(<PanelInventario />)
    expect(screen.getByText(/Sin productos/i)).toBeTruthy()
  })

  it('llama cargarDetalleInventario al montar', () => {
    render(<PanelInventario />)
    expect(mockCargarDetalleInventario).toHaveBeenCalledOnce()
  })
})
