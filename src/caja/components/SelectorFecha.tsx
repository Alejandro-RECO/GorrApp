import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCajaStore } from '@/caja'

function addDays(fecha: string, dias: number): string {
  const d = new Date(fecha + 'T12:00:00')
  d.setDate(d.getDate() + dias)
  return d.toISOString().split('T')[0]
}

export function SelectorFecha() {
  const { fechaActiva, cargarMovimientosDia } = useCajaStore()

  const hoy = new Date().toISOString().split('T')[0]
  const esHoy = fechaActiva === hoy

  const fechaDisplay = new Date(fechaActiva + 'T12:00:00').toLocaleDateString('es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0"
        onClick={() => cargarMovimientosDia(addDays(fechaActiva, -1))}
        aria-label="Día anterior"
      >
        <ChevronLeft className="size-4" />
      </Button>

      <span className="flex-1 text-center text-sm font-medium capitalize select-none">
        {fechaDisplay}
      </span>

      <Button
        variant="ghost"
        size="icon"
        className="h-9 w-9 shrink-0"
        onClick={() => cargarMovimientosDia(addDays(fechaActiva, 1))}
        aria-label="Día siguiente"
      >
        <ChevronRight className="size-4" />
      </Button>

      {!esHoy && (
        <Button
          variant="outline"
          size="sm"
          className="h-9 text-xs ml-1"
          onClick={() => cargarMovimientosDia(hoy)}
        >
          Hoy
        </Button>
      )}
    </div>
  )
}
