import { describe, it, expect } from 'vitest'
import { stockBajo, calcularValorInventario } from '../inventario.utils'

const productoStockBajo = {
  id: 'p-1',
  user_id: 'u1',
  nombre: 'Gorra New Era',
  precio_venta: 50000,
  precio_compra: 30000,
  stock_actual: 5,
  stock_minimo: 5,
  created_at: '2026-05-05T00:00:00Z',
}

const productoStockOk = {
  ...productoStockBajo,
  id: 'p-2',
  stock_actual: 10,
  stock_minimo: 5,
}

describe('stockBajo', () => {
  describe('cuando stock_actual es igual a stock_minimo', () => {
    it('retorna true', () => {
      expect(stockBajo(productoStockBajo)).toBe(true)
    })
  })

  describe('cuando stock_actual es menor que stock_minimo', () => {
    it('retorna true', () => {
      const producto = { ...productoStockBajo, stock_actual: 2, stock_minimo: 5 }
      expect(stockBajo(producto)).toBe(true)
    })
  })

  describe('cuando stock_actual es mayor que stock_minimo', () => {
    it('retorna false', () => {
      expect(stockBajo(productoStockOk)).toBe(false)
    })
  })
})

describe('calcularValorInventario', () => {
  describe('cuando hay productos en inventario', () => {
    it('retorna suma de precio_venta por stock_actual de cada producto', () => {
      const productos = [
        { ...productoStockBajo, precio_venta: 50000, stock_actual: 10 },
        { ...productoStockOk,   precio_venta: 80000, stock_actual: 5  },
      ]
      // 50000*10 + 80000*5 = 500000 + 400000 = 900000
      expect(calcularValorInventario(productos)).toBe(900000)
    })
  })

  describe('cuando no hay productos', () => {
    it('retorna 0', () => {
      expect(calcularValorInventario([])).toBe(0)
    })
  })
})
