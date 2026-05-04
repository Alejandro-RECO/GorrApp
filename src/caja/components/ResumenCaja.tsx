import { Skeleton } from '@/components/ui/skeleton'
import { formatearPesos } from '@/shared/lib/utils'
import { cn } from '@/lib/utils'
import { useCajaStore } from '@/caja'

interface SaldoCardProps {
  label: string
  valor: number
  cargando: boolean
}

function SaldoCard({ label, valor, cargando }: SaldoCardProps) {
  if (cargando) return <Skeleton className="h-16 rounded-xl" />
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-card p-3 ring-1 ring-foreground/10">
      <span className="text-xs text-muted-foreground font-medium truncate">{label}</span>
      <span
        className={cn(
          'text-sm font-semibold tabular-nums leading-tight',
          valor > 0 && 'text-emerald-600 dark:text-emerald-400',
          valor < 0 && 'text-destructive',
          valor === 0 && 'text-foreground',
        )}
      >
        {formatearPesos(valor)}
      </span>
    </div>
  )
}

export function ResumenCajaDia() {
  const { resumen, cargando } = useCajaStore()

  return (
    <div className="grid grid-cols-3 gap-2">
      <SaldoCard label="Efectivo" valor={resumen.efectivo} cargando={cargando} />
      <SaldoCard label="Digital"  valor={resumen.digital}  cargando={cargando} />
      <SaldoCard label="Total"    valor={resumen.total}    cargando={cargando} />
    </div>
  )
}
