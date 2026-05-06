export type TipoNotificacion = 'cliente' | 'venta' | 'abono' | 'compra'

export interface Notificacion {
  id: string
  tipo: TipoNotificacion
  mensaje: string
  leida: boolean
  created_at: string
}
