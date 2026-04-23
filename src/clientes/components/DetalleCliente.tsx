import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatearPesos } from '@/shared/lib/utils'
import { useClientesStore, calcularDeudaTotal, estaEnMora } from '@/clientes'

export function DetalleCliente() {
  const { id } = useParams<{ id: string }>()
  const { clientes, cargando, cargarClientes } = useClientesStore()

  useEffect(() => {
    if (clientes.length === 0) cargarClientes()
  }, [clientes.length, cargarClientes])

  if (cargando) {
    return (
      <div className="flex flex-col gap-4 p-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    )
  }

  const cliente = clientes.find(c => c.id === id)

  if (!cliente) {
    return (
      <div className="p-4">
        <p className="text-muted-foreground">Cliente no encontrado.</p>
      </div>
    )
  }

  const deuda = calcularDeudaTotal(cliente.cuotas)
  const enMora = estaEnMora(cliente.cuotas)

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-semibold">{cliente.nombre}</h1>
        {enMora && (
          <Badge variant="destructive">En mora</Badge>
        )}
      </div>

      <Card className="p-4 flex flex-col gap-3">
        <div>
          <p className="text-xs text-muted-foreground uppercase tracking-wide">Teléfono</p>
          <p className="font-medium">{cliente.telefono}</p>
        </div>

        {cliente.notas && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Notas</p>
            <p className="text-sm">{cliente.notas}</p>
          </div>
        )}

        {deuda > 0 && (
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Deuda total</p>
            <p className="text-2xl font-bold text-foreground">{formatearPesos(deuda)}</p>
          </div>
        )}
      </Card>

      <Card className="p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">
          Historial de compras
        </p>
        <p className="text-sm text-muted-foreground">
          Disponible cuando se implemente el módulo de ventas.
        </p>
      </Card>
    </div>
  )
}
