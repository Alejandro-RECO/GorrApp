import { useEffect } from 'react'
import { TrendingUp, TrendingDown, Banknote, Smartphone, CreditCard, AlertTriangle, Package } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { formatearPesos } from '@/shared/lib/utils'
import { cn } from '@/lib/utils'
import { useReportesStore } from '@/reportes'

function StatCard({
  label,
  value,
  sub,
  Icon,
  accent,
  className,
}: {
  label: string
  value: string
  sub?: string
  Icon: React.ComponentType<{ className?: string }>
  accent?: 'green' | 'red' | 'neutral'
  className?: string
}) {
  return (
    <div className={cn('flex flex-col gap-2 rounded-xl bg-card p-4 ring-1 ring-foreground/10', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      <span
        className={cn(
          'text-xl font-bold tabular-nums leading-tight',
          accent === 'green' && 'text-emerald-600 dark:text-emerald-400',
          accent === 'red' && 'text-destructive',
        )}
      >
        {value}
      </span>
      {sub && <span className="text-xs text-muted-foreground">{sub}</span>}
    </div>
  )
}

export function ResumenGeneralPanel() {
  const { resumen, cargando, error, cargarResumen } = useReportesStore()

  useEffect(() => {
    cargarResumen()
  }, [cargarResumen])

  if (cargando && !resumen) {
    return (
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4, 5].map(i => (
          <Skeleton key={i} className={cn('h-24 rounded-xl', i === 5 && 'col-span-2')} />
        ))}
      </div>
    )
  }

  if (error) {
    return <p className="text-sm text-destructive py-4">{error}</p>
  }

  if (!resumen) return null

  const ratio = resumen.totalVendido > 0
    ? Math.min(100, Math.round((resumen.totalCartera / resumen.totalVendido) * 100))
    : 0

  const rentPos = resumen.rentabilidad >= 0

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Total vendido"
          value={formatearPesos(resumen.totalVendido)}
          Icon={TrendingUp}
          accent="green"
        />
        <StatCard
          label="Cartera pendiente"
          value={formatearPesos(resumen.totalCartera)}
          Icon={CreditCard}
          accent={resumen.totalCartera > 0 ? 'red' : 'neutral'}
        />
        <StatCard
          label="Saldo efectivo"
          value={formatearPesos(resumen.totalEfectivo)}
          Icon={Banknote}
        />
        <StatCard
          label="Saldo digital"
          value={formatearPesos(resumen.totalDigital)}
          Icon={Smartphone}
        />
        <StatCard
          label="Valor en inventario"
          value={formatearPesos(resumen.valorInventario)}
          sub="a precio de venta"
          Icon={Package}
          accent="neutral"
          className="col-span-2"
        />
      </div>

      <div className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground font-medium">Rentabilidad</span>
          {rentPos
            ? <TrendingUp className="size-4 text-emerald-600 dark:text-emerald-400" />
            : <TrendingDown className="size-4 text-destructive" />}
        </div>
        <span className={cn(
          'text-2xl font-bold tabular-nums',
          rentPos ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive',
        )}>
          {rentPos ? '+' : ''}{formatearPesos(resumen.rentabilidad)}
        </span>
        {resumen.totalCartera > 0 && (
          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Cartera / ventas</span>
              <span>{ratio}%</span>
            </div>
            <Progress value={ratio} className="h-1.5" />
          </div>
        )}
        {resumen.clientesEnMora > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-destructive">
            <AlertTriangle className="size-3" />
            <span>{resumen.clientesEnMora} cliente(s) en mora</span>
          </div>
        )}
      </div>
    </div>
  )
}
