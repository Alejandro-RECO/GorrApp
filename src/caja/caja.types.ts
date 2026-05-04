export type TipoMovimiento =
  | 'ingreso_venta'
  | 'ingreso_abono'
  | 'gasto_operativo'
  | 'gasto_inversion'
  | 'compra_mercancia'

export type MedioPago = 'efectivo' | 'digital'

export interface Movimiento {
  id: string
  user_id: string
  tipo: TipoMovimiento
  valor: number
  medio_pago: MedioPago
  fecha: string
  descripcion: string | null
  created_at: string
}

export type CrearMovimiento = {
  tipo: TipoMovimiento
  valor: number
  medioPago: MedioPago
  fecha: string
  descripcion?: string
}
