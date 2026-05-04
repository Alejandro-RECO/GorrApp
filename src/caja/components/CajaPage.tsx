import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCajaStore } from '@/caja'
import { ResumenCajaDia } from './ResumenCaja'
import { SelectorFecha } from './SelectorFecha'
import { ListaMovimientos } from './ListaMovimientos'
import { FormMovimiento } from './FormMovimiento'

export function CajaPage() {
  const { cargarMovimientosDia } = useCajaStore()
  const [formAbierto, setFormAbierto] = useState(false)

  useEffect(() => {
    cargarMovimientosDia()
  }, [cargarMovimientosDia])

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Caja</h1>
        <Button
          size="sm"
          className="min-h-9 gap-1.5"
          onClick={() => setFormAbierto(true)}
        >
          <Plus className="size-4" />
          Movimiento
        </Button>
      </div>

      <SelectorFecha />
      <ResumenCajaDia />
      <ListaMovimientos />

      <FormMovimiento open={formAbierto} onClose={() => setFormAbierto(false)} />
    </div>
  )
}
