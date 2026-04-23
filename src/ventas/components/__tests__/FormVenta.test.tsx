import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'

vi.mock('@/clientes', () => ({
  useClientesStore: vi.fn(),
}))

vi.mock('@/ventas', () => ({
  useVentasStore: vi.fn(),
  calcularCuotas: (params: { total: number; tipo: string; fechaVenta: Date }) => {
    if (params.tipo === 'contado') return []
    const addDays = (d: Date, n: number) => {
      const r = new Date(d)
      r.setDate(r.getDate() + n)
      return r.toISOString().split('T')[0]
    }
    const v = Math.round(params.total / 2)
    if (params.tipo === 'fiado_una_cuota') {
      return [{ numero_cuota: 1, valor: params.total, fecha_vencimiento: addDays(params.fechaVenta, 30), estado: 'pendiente' }]
    }
    return [
      { numero_cuota: 1, valor: v, fecha_vencimiento: addDays(params.fechaVenta, 15), estado: 'pendiente' },
      { numero_cuota: 2, valor: v, fecha_vencimiento: addDays(params.fechaVenta, 30), estado: 'pendiente' },
    ]
  },
}))

import { FormVenta } from '../FormVenta'
import { useClientesStore } from '@/clientes'
import { useVentasStore } from '@/ventas'

const mockClientes = [
  { id: 'c-1', nombre: 'Juan Pérez', telefono: '3001234567', cuotas: [] },
]

beforeEach(() => {
  vi.mocked(useClientesStore).mockImplementation((selector?: any) => {
    const state = {
      clientes: mockClientes,
      cargando: false,
      cargarClientes: vi.fn(),
      agregarCliente: vi.fn(),
      actualizarCliente: vi.fn(),
      eliminarCliente: vi.fn(),
      error: null,
    }
    return selector ? selector(state) : state
  })

  vi.mocked(useVentasStore).mockImplementation((selector?: any) => {
    const state = {
      ventas: [],
      cargando: false,
      error: null,
      cargarVentas: vi.fn(),
      agregarVenta: vi.fn(),
      cargarVentasPorCliente: vi.fn(),
    }
    return selector ? selector(state) : state
  })
})

describe('FormVenta', () => {
  describe('renderizado', () => {
    it('renderiza selector de cliente', () => {
      render(<FormVenta onVentaRegistrada={vi.fn()} />)
      expect(screen.getByLabelText(/cliente/i)).toBeInTheDocument()
    })

    it('renderiza campo total', () => {
      render(<FormVenta onVentaRegistrada={vi.fn()} />)
      expect(screen.getByLabelText(/total/i)).toBeInTheDocument()
    })

    it('renderiza selector tipo de venta (contado/fiado)', () => {
      render(<FormVenta onVentaRegistrada={vi.fn()} />)
      expect(screen.getByLabelText(/tipo de venta/i)).toBeInTheDocument()
    })
  })

  describe('comportamiento condicional', () => {
    it('cuando tipo es fiado muestra selector de número de cuotas', () => {
      render(<FormVenta onVentaRegistrada={vi.fn()} />)

      fireEvent.change(screen.getByLabelText(/tipo de venta/i), {
        target: { value: 'fiado' },
      })

      expect(screen.getByLabelText(/cuotas/i)).toBeInTheDocument()
    })

    it('cuando tipo es contado NO muestra selector de cuotas', () => {
      render(<FormVenta onVentaRegistrada={vi.fn()} />)

      fireEvent.change(screen.getByLabelText(/tipo de venta/i), {
        target: { value: 'contado' },
      })

      expect(screen.queryByLabelText(/cuotas/i)).not.toBeInTheDocument()
    })

    it('muestra resumen de cuotas calculadas antes de confirmar', () => {
      render(<FormVenta onVentaRegistrada={vi.fn()} />)

      fireEvent.change(screen.getByLabelText(/cliente/i), { target: { value: 'c-1' } })
      fireEvent.change(screen.getByLabelText(/total/i), { target: { value: '1000' } })
      fireEvent.change(screen.getByLabelText(/tipo de venta/i), { target: { value: 'fiado' } })

      expect(screen.getByText(/cuota 1|cuota\s*#1/i)).toBeInTheDocument()
    })
  })

  describe('submit', () => {
    it('llama a onVentaRegistrada con los datos correctos al submit válido', async () => {
      const onVentaRegistrada = vi.fn().mockResolvedValue(undefined)
      render(<FormVenta onVentaRegistrada={onVentaRegistrada} />)

      fireEvent.change(screen.getByLabelText(/cliente/i), { target: { value: 'c-1' } })
      fireEvent.change(screen.getByLabelText(/total/i), { target: { value: '1000' } })
      fireEvent.change(screen.getByLabelText(/tipo de venta/i), { target: { value: 'contado' } })
      fireEvent.click(screen.getByRole('button', { name: /registrar/i }))

      await waitFor(() => {
        expect(onVentaRegistrada).toHaveBeenCalledWith(
          expect.objectContaining({
            cliente_id: 'c-1',
            total: 100000,
            tipo: 'contado',
          })
        )
      })
    })
  })
})
