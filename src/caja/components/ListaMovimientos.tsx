import { useState } from 'react'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { formatearPesos } from '@/shared/lib/utils'
import { cn } from '@/lib/utils'
import { useCajaStore, esIngreso, type MedioPago } from '@/caja'

const TIPO_ETIQUETAS: Record<string, string> = {
  ingreso_venta:    'Venta',
  ingreso_abono:    'Abono',
  gasto_operativo:  'Gasto op.',
  gasto_inversion:  'Inversión',
  compra_mercancia: 'Compra',
}

type Filtro = 'todos' | MedioPago

const FILTROS: { value: Filtro; label: string }[] = [
  { value: 'todos',    label: 'Todos'    },
  { value: 'efectivo', label: 'Efectivo' },
  { value: 'digital',  label: 'Digital'  },
]

export function ListaMovimientos() {
  const { movimientos, cargando, error } = useCajaStore()
  const [filtro, setFiltro] = useState<Filtro>('todos')

  const filtrados = filtro === 'todos'
    ? movimientos
    : movimientos.filter(m => m.medio_pago === filtro)

  if (cargando && movimientos.length === 0) {
    return (
      <div className="flex flex-col gap-2">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-1">
        {FILTROS.map(f => (
          <button
            key={f.value}
            onClick={() => setFiltro(f.value)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              filtro === f.value
                ? 'bg-foreground text-background'
                : 'bg-muted text-muted-foreground hover:bg-muted/80',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {filtrados.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-10">
          Sin movimientos registrados
        </p>
      ) : (
        <div className="rounded-xl overflow-hidden ring-1 ring-foreground/10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-14">Hora</TableHead>
                <TableHead className="w-20">Tipo</TableHead>
                <TableHead className="hidden sm:table-cell">Descripción</TableHead>
                <TableHead className="w-20">Medio</TableHead>
                <TableHead className="text-right w-24">Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.map(m => {
                const ingreso = esIngreso(m.tipo)
                const hora = new Date(m.created_at).toLocaleTimeString('es-CO', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
                return (
                  <TableRow key={m.id}>
                    <TableCell className="text-xs text-muted-foreground tabular-nums">
                      {hora}
                    </TableCell>
                    <TableCell className="text-xs font-medium">
                      {TIPO_ETIQUETAS[m.tipo] ?? m.tipo}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-xs text-muted-foreground max-w-[180px] truncate">
                      {m.descripcion}
                    </TableCell>
                    <TableCell className="text-xs capitalize text-muted-foreground">
                      {m.medio_pago}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'text-right text-sm font-semibold tabular-nums',
                        ingreso
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-destructive',
                      )}
                    >
                      {ingreso ? '+' : '−'}{formatearPesos(m.valor)}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
