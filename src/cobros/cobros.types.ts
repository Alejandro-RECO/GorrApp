export type EstadoCuota = 'pendiente' | 'pagada' | 'vencida'

export interface Cuota {
  id: string
  venta_id: string
  numero_cuota: number
  valor: number
  fecha_vencimiento: string
  estado: EstadoCuota
  created_at: string
  updated_at: string
}

export interface CuotaConCliente extends Cuota {
  ventas: {
    id: string
    total: number
    notas: string | null
    clientes: {
      id: string
      nombre: string
      telefono: string
    }
  }
}

export interface Abono {
  id: string
  user_id: string
  cuota_id: string
  valor: number
  medio_pago: 'efectivo' | 'digital'
  notas: string | null
  created_at: string
}

export type CrearAbono = {
  cuotaId: string
  valor: number
  medioPago: 'efectivo' | 'digital'
  notas?: string
}