export type TipoVenta = 'contado' | 'fiado_una_cuota' | 'fiado_dos_cuotas'
export type MedioPago = 'efectivo' | 'digital'

export interface CuotaCalculada {
  numero_cuota: number
  valor: number
  fecha_vencimiento: string
  estado: 'pendiente'
}

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
  clientes?: { nombre: string }
}

export type CrearVenta = {
  cliente_id: string
  total: number
  tipo: TipoVenta
  medio_pago: MedioPago
  notas?: string | null
}
