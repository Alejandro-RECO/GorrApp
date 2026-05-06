import { formatearPesos } from '@/shared/lib/utils'

type TablaNotificacion = 'clientes' | 'ventas' | 'abonos' | 'compras_inventario'

export function formatearMensaje(
  payload: Record<string, unknown>,
  tabla: TablaNotificacion,
  currentUserId: string
): string | null {
  if (payload.user_id === currentUserId) return null

  switch (tabla) {
    case 'clientes':
      return `Nuevo cliente: ${payload.nombre}`

    case 'ventas': {
      const tipo = payload.tipo === 'contado' ? 'contado'
        : payload.tipo === 'fiado_una_cuota' ? 'fiado 1 cuota'
        : 'fiado 2 cuotas'
      return `Venta ${tipo} registrada: ${formatearPesos(payload.total as number)}`
    }

    case 'abonos':
      return `Abono recibido: ${formatearPesos(payload.valor as number)}`

    case 'compras_inventario':
      return `Compra registrada: ${payload.cantidad} unidades · ${formatearPesos(payload.total as number)}`

    default:
      return null
  }
}
