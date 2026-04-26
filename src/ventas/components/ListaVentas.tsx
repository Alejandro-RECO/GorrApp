import { useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { formatearPesos } from '@/shared/lib/utils'
import { useVentasStore } from '@/ventas'
import type { TipoVenta } from '@/ventas'

interface Props {
  clienteId?: string
}

function TipoBadge({ tipo }: { tipo: TipoVenta }) {
  if (tipo === 'contado') {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800">
        Contado
      </Badge>
    )
  }
  const label = tipo === 'fiado_una_cuota' ? 'Fiado 1c' : 'Fiado 2c'
  return (
    <Badge className="bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800">
      {label}
    </Badge>
  )
}

export function ListaVentas({ clienteId }: Props) {
  const { ventas, cargando, error, cargarVentas } = useVentasStore()

  useEffect(() => {
    cargarVentas()
  }, [cargarVentas])

  const lista = clienteId
    ? ventas.filter(v => v.cliente_id === clienteId)
    : ventas

  if (cargando && ventas.length === 0) {
    return (
      <div className="flex flex-col gap-3 p-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-12 w-full rounded-lg" />
        ))}
      </div>
    )
  }

  if (error) {
    return <p className="p-4 text-sm text-destructive">{error}</p>
  }

  if (lista.length === 0) {
    return (
      <p className="p-4 text-center text-sm text-muted-foreground py-12">
        Sin ventas registradas
      </p>
    )
  }

  return (
    <div className="p-4">
      {!clienteId && (
        <h1 className="text-xl font-semibold mb-4">Ventas</h1>
      )}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cliente</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="hidden sm:table-cell">Fecha</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {lista.map(venta => (
            <TableRow key={venta.id}>
              <TableCell className="font-medium">
                {venta.clientes?.nombre ?? '—'}
              </TableCell>
              <TableCell>{formatearPesos(venta.total)}</TableCell>
              <TableCell>
                <TipoBadge tipo={venta.tipo} />
              </TableCell>
              <TableCell className="hidden sm:table-cell text-muted-foreground text-xs">
                {new Date(venta.created_at).toLocaleDateString('es-CO', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
