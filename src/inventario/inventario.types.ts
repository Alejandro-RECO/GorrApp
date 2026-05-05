export type MedioPago = 'efectivo' | 'digital'

export interface Producto {
  id: string
  user_id: string
  nombre: string
  precio_venta: number
  stock_actual: number
  stock_minimo: number
  activo: boolean
  created_at: string
  updated_at: string
}

export interface CompraInventario {
  id: string
  user_id: string
  producto_id: string
  cantidad: number
  precio_compra: number
  total: number
  proveedor: string | null
  notas: string | null
  created_at: string
}

export type CrearProducto = {
  nombre: string
  precio_venta: number
  stock_actual?: number
  stock_minimo?: number
}

export type RegistrarCompra = {
  producto_id: string
  cantidad: number
  precio_unitario: number
  medio_pago: MedioPago
  fecha: string
  proveedor?: string
  notas?: string
}

export type ActualizarProducto = Partial<Pick<Producto, 'nombre' | 'precio_venta' | 'stock_minimo' | 'activo'>>
