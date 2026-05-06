import { useState, useRef, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useNotificacionesStore } from '@/notificaciones'
import type { TipoNotificacion } from '@/notificaciones'

const ICONO: Record<TipoNotificacion, string> = {
  cliente: '👤',
  venta:   '💰',
  abono:   '💳',
  compra:  '📦',
}

function tiempoRelativo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'ahora'
  if (min < 60) return `hace ${min}m`
  const h = Math.floor(min / 60)
  if (h < 24) return `hace ${h}h`
  return `hace ${Math.floor(h / 24)}d`
}

export function NotificacionesBell() {
  const { notificaciones, noLeidas, marcarTodasLeidas, eliminarNotificacion } = useNotificacionesStore()
  const [abierto, setAbierto] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAbierto(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleAbrir = () => {
    setAbierto(v => !v)
    if (!abierto && noLeidas > 0) {
      marcarTodasLeidas()
    }
  }

  const visibles = notificaciones.slice(0, 15)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleAbrir}
        className={cn(
          'relative flex size-9 items-center justify-center rounded-lg transition-colors',
          abierto
            ? 'bg-accent text-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
        )}
        aria-label="Notificaciones"
      >
        <Bell className="size-4" />
        {noLeidas > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-white">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>

      {abierto && (
        <div className="absolute right-0 top-11 z-50 w-80 rounded-xl bg-card shadow-lg ring-1 ring-foreground/10">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="text-sm font-semibold">Notificaciones</span>
            {notificaciones.length > 0 && (
              <button
                onClick={marcarTodasLeidas}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Marcar como leídas
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {visibles.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Sin notificaciones
              </p>
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {visibles.map(n => (
                  <div
                    key={n.id}
                    className={cn(
                      'flex items-start gap-3 px-4 py-3 text-sm transition-colors',
                      !n.leida && 'bg-primary/5'
                    )}
                  >
                    <span className="mt-0.5 text-base leading-none">
                      {ICONO[n.tipo]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm leading-snug', !n.leida && 'font-medium')}>
                        {n.mensaje}
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {tiempoRelativo(n.created_at)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {!n.leida && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); eliminarNotificacion(n.id) }}
                        className="flex size-5 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                        aria-label="Eliminar notificación"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
