export type TipoVenta = 'contado' | 'fiado_una_cuota' | 'fiado_dos_cuotas'
export type MedioPago = 'efectivo' | 'digital'
export type EstadoCuota = 'pendiente' | 'pagada' | 'vencida'

export interface Venta {
  id: string
  user_id: string
  cliente_id: string
  total: number
  tipo: TipoVenta
  medio_pago: MedioPago
  notas: string | null
  created_at: string
  updated_at: string
}

export type CrearVenta = {
  cliente_id: string
  total: number
  tipo: TipoVenta
  medio_pago: MedioPago
  notas?: string | null
}

export interface CuotaCalculada {
  numero_cuota: number
  valor: number
  fecha_vencimiento: string
  estado: EstadoCuota
}

export interface VentaConCliente extends Venta {
  clientes: {
    id: string
    nombre: string
    telefono: string
  } | null
}
