export interface CuotaResumen {
  id: string
  valor: number
  estado: 'pendiente' | 'pagada' | 'vencida'
  fecha_vencimiento: string
}

export interface Cliente {
  id: string
  user_id: string
  nombre: string
  telefono: string
  notas: string | null
  created_at: string
  updated_at: string
  cuotas: CuotaResumen[]
}

export type CrearCliente = {
  nombre: string
  telefono: string
  notas?: string | null
}

export type ActualizarCliente = Partial<CrearCliente>

export interface ProductoEnVenta {
  producto_id: string
  nombre: string
  cantidad: number
  precio_venta: number
}

export interface VentaConProductos {
  id: string
  total: number
  tipo: 'contado' | 'fiado_una_cuota' | 'fiado_dos_cuotas'
  medio_pago: 'efectivo' | 'digital'
  created_at: string
  notas: string | null
  productos: ProductoEnVenta[]
  cuotas: CuotaResumen[]
}
