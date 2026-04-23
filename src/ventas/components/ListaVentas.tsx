import { useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatearPesos } from '@/shared/lib/utils'
import { useVentasStore } from '@/ventas'

interface Props {
  clienteId?: string
}

const ETIQUETA_TIPO: Record<string, string> = {
  contado: 'Contado',
  fiado_una_cuota: 'Fiado 1 cuota',
  fiado_dos_cuotas: 'Fiado 2 cuotas',
}

export function ListaVentas({ clienteId }: Props) {
  const { ventas, cargando, error, cargarVentas, cargarVentasPorCliente } = useVentasStore()

  useEffect(() => {
    if (clienteId) {
      cargarVentasPorCliente(clienteId)
    } else {
      cargarVentas()
    }
  }, [clienteId, cargarVentas, cargarVentasPorCliente])

  if (cargando && ventas.length === 0) {
    return (
      <div className="flex flex-col gap-3 p-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (ventas.length === 0) {
    return (
      <p className="text-center text-muted-foreground py-12">Sin ventas</p>
    )
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      {error && <p className="text-sm text-destructive">{error}</p>}
      {ventas.map(venta => {
        const esFiado = venta.tipo !== 'contado'

        return (
          <Card key={venta.id} className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-medium truncate">
                    {venta.clientes?.nombre ?? '—'}
                  </span>
                  <Badge variant={esFiado ? 'outline' : 'default'} className="text-xs shrink-0">
                    {ETIQUETA_TIPO[venta.tipo] ?? venta.tipo}
                  </Badge>
                </div>
                <span className="text-sm font-semibold">{formatearPesos(venta.total)}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(venta.created_at).toLocaleDateString('es-CO')}
                </span>
              </div>
            </div>
          </Card>
        )
      })}
    </div>
  )
}
