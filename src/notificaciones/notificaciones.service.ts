import { toast } from 'sonner'
import { supabase } from '@/shared/lib/supabase'
import { formatearMensaje } from './notificaciones.utils'
import { useNotificacionesStore } from './notificaciones.store'
import type { TipoNotificacion } from './notificaciones.types'

let _channel: ReturnType<typeof supabase.channel> | null = null

type TablaConfig = {
  table: string
  tipo: TipoNotificacion
}

const TABLAS: TablaConfig[] = [
  { table: 'clientes',             tipo: 'cliente' },
  { table: 'ventas',               tipo: 'venta'   },
  { table: 'abonos',               tipo: 'abono'   },
  { table: 'compras_inventario',   tipo: 'compra'  },
]

export function iniciarNotificaciones(negocioId: string, userId: string) {
  _channel?.unsubscribe()

  let canal = supabase.channel(`notificaciones-${negocioId}`)

  for (const { table, tipo } of TABLAS) {
    canal = canal.on(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      'postgres_changes' as any,
      {
        event: 'INSERT',
        schema: 'public',
        table,
        filter: `negocio_id=eq.${negocioId}`,
      },
      (payload: { new: Record<string, unknown> }) => {
        const tabla = table as Parameters<typeof formatearMensaje>[1]
        const mensaje = formatearMensaje(payload.new, tabla, userId)
        if (!mensaje) return

        useNotificacionesStore.getState().agregarNotificacion({ tipo, mensaje })
        toast(mensaje, {
          icon: tipo === 'cliente' ? '👤'
            : tipo === 'venta'   ? '💰'
            : tipo === 'abono'   ? '💳'
            : '📦',
        })
      }
    )
  }

  _channel = canal.subscribe()
}

export function detenerNotificaciones() {
  _channel?.unsubscribe()
  _channel = null
}
