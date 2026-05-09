import { useEffect, useState } from 'react'
import { ShoppingBag, Package, CreditCard, Banknote, Smartphone } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { formatearPesos } from '@/shared/lib/utils'
import { ClientesService } from '@/clientes/clientes.service'
import type { Cliente, VentaConProductos } from '@/clientes/clientes.types'

const TIPO_LABEL: Record<string, string> = {
  contado: 'Contado',
  fiado_una_cuota: 'Fiado 1 cuota',
  fiado_dos_cuotas: 'Fiado 2 cuotas',
}

const ESTADO_VARIANT: Record<string, 'default' | 'destructive' | 'secondary'> = {
  pagada: 'secondary',
  pendiente: 'default',
  vencida: 'destructive',
}

function MedioPagoIcon({ medio }: { medio: string }) {
  if (medio === 'efectivo') return <Banknote className="size-3.5 text-muted-foreground" />
  return <Smartphone className="size-3.5 text-muted-foreground" />
}

interface Props {
  cliente: Cliente | null
  open: boolean
  onClose: () => void
}

export function HistorialComprasSheet({ cliente, open, onClose }: Props) {
  const [ventas, setVentas] = useState<VentaConProductos[]>([])
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !cliente) return
    setCargando(true)
    setError(null)
    ClientesService.obtenerVentasCliente(cliente.id)
      .then(data => { setVentas(data); setCargando(false) })
      .catch(() => { setError('No se pudo cargar el historial'); setCargando(false) })
  }, [open, cliente])

  return (
    <Sheet open={open} onOpenChange={v => { if (!v) onClose() }}>
      <SheetContent side="bottom" className="h-[85vh] flex flex-col rounded-t-2xl px-0">
        <SheetHeader className="px-4 pb-2">
          <SheetTitle className="flex items-center gap-2 text-base">
            <ShoppingBag className="size-4" />
            {cliente?.nombre}
          </SheetTitle>
          <p className="text-sm text-muted-foreground">{cliente?.telefono}</p>
        </SheetHeader>

        <Separator />

        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
          {cargando && (
            <div className="flex flex-col gap-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-28 w-full rounded-xl" />
              ))}
            </div>
          )}

          {error && (
            <p className="text-sm text-destructive py-4 text-center">{error}</p>
          )}

          {!cargando && !error && ventas.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-muted-foreground">
              <ShoppingBag className="size-10 opacity-30" />
              <p className="text-sm">Sin compras registradas</p>
            </div>
          )}

          {!cargando && ventas.map(venta => {
            const fecha = new Date(venta.created_at)
            const fechaStr = fecha.toLocaleDateString('es-CO', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })

            return (
              <div
                key={venta.id}
                className="rounded-xl bg-card ring-1 ring-foreground/10 p-4 flex flex-col gap-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs text-muted-foreground">{fechaStr}</span>
                    <span className="font-semibold tabular-nums">{formatearPesos(venta.total)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MedioPagoIcon medio={venta.medio_pago} />
                    <Badge variant="secondary" className="text-xs">
                      {TIPO_LABEL[venta.tipo] ?? venta.tipo}
                    </Badge>
                  </div>
                </div>

                {venta.productos.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Package className="size-3" />
                      <span>Productos</span>
                    </div>
                    {venta.productos.map(p => (
                      <div
                        key={p.producto_id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-foreground">{p.nombre}</span>
                        <span className="text-muted-foreground tabular-nums">
                          ×{p.cantidad}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {venta.cuotas.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <CreditCard className="size-3" />
                      <span>Cuotas</span>
                    </div>
                    {venta.cuotas.map((c, i) => {
                      const fechaCuota = new Date(c.fecha_vencimiento).toLocaleDateString('es-CO', {
                        day: '2-digit',
                        month: 'short',
                      })
                      return (
                        <div key={c.id} className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Cuota {i + 1} · {fechaCuota}</span>
                          <div className="flex items-center gap-2">
                            <span className="tabular-nums">{formatearPesos(c.valor)}</span>
                            <Badge variant={ESTADO_VARIANT[c.estado] ?? 'secondary'} className="text-xs">
                              {c.estado}
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {venta.notas && (
                  <p className="text-xs text-muted-foreground italic border-t border-foreground/5 pt-2">
                    {venta.notas}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </SheetContent>
    </Sheet>
  )
}
