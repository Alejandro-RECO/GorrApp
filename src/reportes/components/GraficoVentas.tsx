import { useEffect, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { Skeleton } from '@/components/ui/skeleton'
import { formatearPesos } from '@/shared/lib/utils'
import { useReportesStore, agruparVentasPorDia } from '@/reportes'
import { SelectorPeriodo } from './SelectorPeriodo'

function haceDias(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

function hoy(): string {
  return new Date().toISOString().split('T')[0]
}

function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg bg-card px-3 py-2 text-xs ring-1 ring-foreground/10 shadow-md">
      <p className="text-muted-foreground mb-0.5">{label}</p>
      <p className="font-semibold tabular-nums">{formatearPesos(payload[0].value)}</p>
    </div>
  )
}

export function GraficoVentas() {
  const { ventasPeriodo, cargando, error, cargarVentasPeriodo } = useReportesStore()
  const [desde, setDesde] = useState(haceDias(7))
  const [hasta, setHasta] = useState(hoy())

  useEffect(() => {
    cargarVentasPeriodo(desde, hasta)
  }, [desde, hasta, cargarVentasPeriodo])

  const datos = Object.entries(agruparVentasPorDia(ventasPeriodo))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, total]) => ({
      fecha: fecha.slice(5).replace('-', '/'),
      total,
    }))

  const handlePeriodo = (d: string, h: string) => {
    setDesde(d)
    setHasta(h)
  }

  return (
    <div className="flex flex-col gap-4">
      <SelectorPeriodo desde={desde} hasta={hasta} onChange={handlePeriodo} />

      {error && <p className="text-sm text-destructive">{error}</p>}

      {cargando ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : datos.length === 0 ? (
        <div className="flex items-center justify-center h-48 rounded-xl bg-muted/30">
          <p className="text-sm text-muted-foreground">Sin ventas en el período</p>
        </div>
      ) : (
        <div className="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={datos} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="fecha"
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tickFormatter={v => `$${Math.round(v / 1000)}k`}
                tick={{ fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                width={38}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted))' }} />
              <Bar
                dataKey="total"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {datos.length > 0 && (
        <div className="flex justify-between text-xs text-muted-foreground px-1">
          <span>{ventasPeriodo.length} ventas</span>
          <span className="font-medium tabular-nums text-foreground">
            {formatearPesos(ventasPeriodo.reduce((s, v) => s + v.total, 0))}
          </span>
        </div>
      )}
    </div>
  )
}
