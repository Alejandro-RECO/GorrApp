import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { FormCliente } from '../FormCliente'

describe('FormCliente', () => {
  describe('renderizado', () => {
    it('renderiza campo nombre', () => {
      render(<FormCliente onGuardar={vi.fn()} />)
      expect(screen.getByLabelText(/nombre/i)).toBeInTheDocument()
    })

    it('renderiza campo telefono', () => {
      render(<FormCliente onGuardar={vi.fn()} />)
      expect(screen.getByLabelText(/tel[eé]fono/i)).toBeInTheDocument()
    })
  })

  describe('validación', () => {
    it('nombre es obligatorio — muestra error si vacío al submit', async () => {
      render(<FormCliente onGuardar={vi.fn()} />)

      fireEvent.click(screen.getByRole('button', { name: /guardar/i }))

      await waitFor(() => {
        expect(screen.getByText(/nombre.*obligatorio|nombre.*requerido/i)).toBeInTheDocument()
      })
    })

    it('telefono es obligatorio — muestra error si vacío al submit', async () => {
      render(<FormCliente onGuardar={vi.fn()} />)

      fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Juan Pérez' } })
      fireEvent.click(screen.getByRole('button', { name: /guardar/i }))

      await waitFor(() => {
        expect(screen.getByText(/tel[eé]fono.*obligatorio|tel[eé]fono.*requerido/i)).toBeInTheDocument()
      })
    })

    it('llama a onGuardar con los datos correctos al submit válido', async () => {
      const onGuardar = vi.fn().mockResolvedValue(undefined)
      render(<FormCliente onGuardar={onGuardar} />)

      fireEvent.change(screen.getByLabelText(/nombre/i), { target: { value: 'Juan Pérez' } })
      fireEvent.change(screen.getByLabelText(/tel[eé]fono/i), { target: { value: '3001234567' } })
      fireEvent.click(screen.getByRole('button', { name: /guardar/i }))

      await waitFor(() => {
        expect(onGuardar).toHaveBeenCalledWith(
          expect.objectContaining({
            nombre: 'Juan Pérez',
            telefono: '3001234567',
          })
        )
      })
    })
  })
})
