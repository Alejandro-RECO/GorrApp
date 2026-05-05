import { useEffect } from 'react'
import { Copy } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { formatearPesos } from '@/shared/lib/utils'
import { generarMensajeCobro } from '@/cobros'
import { useReportesStore } from '@/reportes'
import type { CuotaConCliente } from '@/cobros'

function diasVencido(fechaVencimiento: string): number {
  const hoy = new Date()
  const venc = new Date(fechaVencimiento)
  return Math.max(0, Math.floor((hoy.getTime() - venc.getTime()) / 86400000))
}

function copiarMensaje(cuota: CuotaConCliente) {
  const cliente = cuota.ventas.clientes
  const mensaje = generarMensajeCobro(cliente, [cuota])
  navigator.clipboard.writeText(mensaje).catch(() => {})
}

export function TablaCartera() {
  const { carteraPendiente, cargando, error, cargarCarteraPendiente } = useReportesStore()

  useEffect(() => {
    cargarCarteraPendiente()
  }, [cargarCarteraPendiente])

  if (cargando && carteraPendiente.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
      </div>
    )
  }

  if (error) return <p className="text-sm text-destructive py-4">{error}</p>

  if (carteraPendiente.length === 0) {
    return (
      <p className="text-center text-sm text-muted-foreground py-10">
        Sin cuotas pendientes
      </p>
    )
  }

  const ordenadas = [...carteraPendiente].sort(
    (a, b) => diasVencido(b.fecha_vencimiento) - diasVencido(a.fecha_vencimiento)
  )

  return (
    <div className="rounded-xl overflow-hidden ring-1 ring-foreground/10">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead className="text-right w-24">Valor</TableHead>
            <TableHead className="w-24">Estado</TableHead>
            <TableHead className="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {ordenadas.map(c => {
            const dias = diasVencido(c.fecha_vencimiento)
            const vencida = c.estado === 'vencida' || dias > 0
            return (
              <TableRow key={c.id}>
                <TableCell>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-medium text-sm">{c.ventas.clientes.nombre}</span>
                    <span className="text-xs text-muted-foreground">{c.ventas.clientes.telefono}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right text-sm font-semibold tabular-nums">
                  {formatearPesos(c.valor)}
                </TableCell>
                <TableCell>
                  {vencida ? (
                    <Badge variant="destructive" className="text-xs py-0">
                      {dias}d vencida
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs py-0 text-amber-600 border-amber-300">
                      Por vencer
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="size-9 p-0"
                    onClick={() => copiarMensaje(c)}
                    title="Copiar mensaje"
                  >
                    <Copy className="size-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
