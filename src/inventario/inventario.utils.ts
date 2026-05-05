import type { Producto } from './inventario.types'

export function stockBajo(
  producto: Pick<Producto, 'stock_actual' | 'stock_minimo'>
): boolean {
  return producto.stock_actual <= producto.stock_minimo
}

export function calcularValorInventario(
  productos: Pick<Producto, 'precio_venta' | 'stock_actual'>[]
): number {
  return productos.reduce((total, p) => total + p.precio_venta * p.stock_actual, 0)
}
