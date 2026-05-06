import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatearPesos } from '@/shared/lib/utils'
import { useCobrosStore } from '@/cobros'
import type { CuotaConCliente } from '@/cobros'
import { FormAbono } from './FormAbono'
import { MensajeCobro } from './MensajeCobro'

function getBadgeVariant(estado: string, estaVencida: boolean): 'default' | 'destructive' | 'secondary' | 'outline' {
  if (estado === 'pagada') return 'secondary'
  if (estaVencida) return 'destructive'
  return 'default'
}

function EstadoBadge({ estado, vencida }: { estado: string; vencida: boolean }) {
  const variant = getBadgeVariant(estado, vencida)
  const label = estado === 'pagada' ? 'Pagada' : vencida ? 'Vencida' : 'Pendiente'
  return <Badge variant={variant}>{label}</Badge>
}

export function ListaCobros() {
  const { cuotasPendientes, cargando, error, cargarCuotasPendientes } = useCobrosStore()
  const [cuotaSeleccionada, setCuotaSeleccionada] = useState<CuotaConCliente | null>(null)
  const [mostrarMensaje, setMostrarMensaje] = useState<CuotaConCliente | null>(null)

  useEffect(() => {
    cargarCuotasPendientes()
  }, [cargarCuotasPendientes])

  const sortedCuotas = [...cuotasPendientes].sort((a, b) => {
    const aVencida = a.fecha_vencimiento < new Date().toISOString().split('T')[0]
    const bVencida = b.fecha_vencimiento < new Date().toISOString().split('T')[0]
    if (aVencida && !bVencida) return -1
    if (!aVencida && bVencida) return 1
    return new Date(a.fecha_vencimiento).getTime() - new Date(b.fecha_vencimiento).getTime()
  })

  if (cargando && cuotasPendientes.length === 0) {
    return (
      <div className="flex flex-col gap-3 p-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-24 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Cobros</h1>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {sortedCuotas.length === 0 ? (
        <p className="text-center text-muted-foreground py-12">Sin cuotas pendientes</p>
      ) : (
        <div className="flex flex-col gap-3">
          {sortedCuotas.map(cuota => {
            const cliente = cuota.ventas?.clientes
            const today = new Date().toISOString().split('T')[0]
            const estaVencida = cuota.fecha_vencimiento < today && cuota.estado !== 'pagada'

            return (
              <Card key={cuota.id} className="p-4">
                <div className="flex flex-col gap-3">
                  <div className="flex items-start justify-between">
                    <div className="flex flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium truncate">{cliente?.nombre || 'Sin cliente'}</span>
                        <EstadoBadge estado={cuota.estado} vencida={estaVencida} />
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Cuota {cuota.numero_cuota} · {formatearPesos(cuota.valor)}
                      </span>
                    </div>
                  </div>

                  {cuota.ventas?.notas && (
                    <p className="text-xs text-muted-foreground italic border-l-2 border-muted pl-2">
                      {cuota.ventas.notas}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      Vence: {new Date(cuota.fecha_vencimiento).toLocaleDateString('es-CO')}
                    </span>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="min-h-9"
                        onClick={() => setMostrarMensaje(cuota)}
                      >
                        WhatsApp
                      </Button>
                      <Button
                        size="sm"
                        className="min-h-9"
                        onClick={() => setCuotaSeleccionada(cuota)}
                        disabled={cuota.estado === 'pagada'}
                      >
                        Abonar
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {cuotaSeleccionada && (
        <FormAbono
          cuota={cuotaSeleccionada}
          onClose={() => setCuotaSeleccionada(null)}
          onAbonado={() => {
            setCuotaSeleccionada(null)
            cargarCuotasPendientes()
          }}
        />
      )}

      {mostrarMensaje && (
        <MensajeCobro
          cuota={mostrarMensaje}
          onClose={() => setMostrarMensaje(null)}
        />
      )}
    </div>
  )
}