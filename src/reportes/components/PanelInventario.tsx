import { useEffect } from 'react'
import { Package } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { formatearPesos } from '@/shared/lib/utils'
import { useReportesStore } from '@/reportes'

export function PanelInventario() {
  const { resumen, detalleInventario, cargando, error, cargarDetalleInventario } = useReportesStore()

  useEffect(() => {
    cargarDetalleInventario()
  }, [cargarDetalleInventario])

  if (cargando && detalleInventario.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        <Skeleton className="h-20 w-full rounded-xl" />
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (error) return <p className="text-sm text-destructive py-4">{error}</p>

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium">Total en inventario</span>
          <Package className="size-4 text-muted-foreground" />
        </div>
        <span className="text-2xl font-bold tabular-nums">
          {formatearPesos(resumen?.valorInventario ?? 0)}
        </span>
        <span className="text-xs text-muted-foreground">a precio de venta</span>
      </div>

      {detalleInventario.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
          <Package className="size-10 opacity-30" />
          <p className="text-sm">Sin productos en inventario</p>
        </div>
      ) : (
        <div className="rounded-xl bg-card ring-1 ring-foreground/10 overflow-hidden">
          {detalleInventario.map((producto, i) => (
            <div key={producto.id}>
              {i > 0 && <Separator />}
              <div className="flex items-center justify-between px-4 py-3 gap-2">
                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium text-sm truncate">{producto.nombre}</span>
                    {producto.stock_bajo && (
                      <Badge variant="destructive" className="text-xs py-0 shrink-0">
                        Stock bajo
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {producto.stock_actual} uds × {formatearPesos(producto.precio_venta)}
                  </span>
                </div>
                <span className="font-semibold tabular-nums text-sm shrink-0">
                  {formatearPesos(producto.valor_total)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
