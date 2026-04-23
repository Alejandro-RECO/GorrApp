import { formatearPesos } from '@/shared/lib/utils'
import type { CuotaCalculada } from '@/ventas'

interface Props {
  cuotas: CuotaCalculada[]
}

export function ResumenCuotas({ cuotas }: Props) {
  if (cuotas.length === 0) return null

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-muted/40 p-3">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
        Cuotas a pagar
      </p>
      {cuotas.map(c => (
        <div key={c.numero_cuota} className="flex items-center justify-between text-sm">
          <span className="font-medium">Cuota {c.numero_cuota}</span>
          <span>{formatearPesos(c.valor)}</span>
          <span className="text-muted-foreground">{c.fecha_vencimiento}</span>
        </div>
      ))}
    </div>
  )
}
