import { cn } from '@/lib/utils'

type Preset = 'semana' | 'mes'

interface Props {
  desde: string
  hasta: string
  onChange: (desde: string, hasta: string) => void
}

function hoy(): string {
  return new Date().toISOString().split('T')[0]
}

function haceDias(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

const PRESETS: { value: Preset; label: string; dias: number }[] = [
  { value: 'semana', label: 'Semana', dias: 7 },
  { value: 'mes',    label: 'Mes',    dias: 30 },
]

export function SelectorPeriodo({ desde, hasta, onChange }: Props) {
  const presetActivo = (() => {
    const h = hoy()
    if (desde === haceDias(7) && hasta === h) return 'semana'
    if (desde === haceDias(30) && hasta === h) return 'mes'
    return null
  })()

  const aplicarPreset = (dias: number) => {
    onChange(haceDias(dias), hoy())
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex gap-1">
        {PRESETS.map(p => (
          <button
            key={p.value}
            onClick={() => aplicarPreset(p.dias)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors min-h-9',
              presetActivo === p.value
                ? 'bg-foreground text-background'
                : 'bg-muted text-muted-foreground hover:bg-muted/80',
            )}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <input
          type="date"
          value={desde}
          max={hasta}
          onChange={e => onChange(e.target.value, hasta)}
          className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground min-h-9 focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <span>→</span>
        <input
          type="date"
          value={hasta}
          min={desde}
          max={hoy()}
          onChange={e => onChange(desde, e.target.value)}
          className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs text-foreground min-h-9 focus:outline-none focus:ring-1 focus:ring-ring"
        />
      </div>
    </div>
  )
}
