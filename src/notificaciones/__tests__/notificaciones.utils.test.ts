import { describe, it, expect } from 'vitest'
import { formatearMensaje } from '../notificaciones.utils'

const OTHER_USER = 'user-otro'
const CURRENT_USER = 'user-actual'

describe('formatearMensaje', () => {
  describe('tabla clientes', () => {
    it('retorna mensaje con el nombre del cliente', () => {
      const payload = { user_id: OTHER_USER, nombre: 'Juan Pérez', telefono: '3001234567' }
      const msg = formatearMensaje(payload, 'clientes', CURRENT_USER)
      expect(msg).toBe('Nuevo cliente: Juan Pérez')
    })
  })

  describe('tabla ventas', () => {
    it('retorna mensaje con tipo y total formateado', () => {
      const payload = { user_id: OTHER_USER, tipo: 'contado', total: 50000 }
      const msg = formatearMensaje(payload, 'ventas', CURRENT_USER)
      expect(msg).toContain('50.000')
    })
  })

  describe('tabla abonos', () => {
    it('retorna mensaje con el valor del abono formateado', () => {
      const payload = { user_id: OTHER_USER, valor: 30000 }
      const msg = formatearMensaje(payload, 'abonos', CURRENT_USER)
      expect(msg).toContain('30.000')
    })
  })

  describe('tabla compras_inventario', () => {
    it('retorna mensaje con cantidad de unidades', () => {
      const payload = { user_id: OTHER_USER, cantidad: 20, total: 600000 }
      const msg = formatearMensaje(payload, 'compras_inventario', CURRENT_USER)
      expect(msg).toContain('20')
    })
  })

  describe('cuando el payload es del usuario actual', () => {
    it('retorna null para no auto-notificar', () => {
      const payload = { user_id: CURRENT_USER, nombre: 'Mi cliente' }
      const msg = formatearMensaje(payload, 'clientes', CURRENT_USER)
      expect(msg).toBeNull()
    })
  })
})
