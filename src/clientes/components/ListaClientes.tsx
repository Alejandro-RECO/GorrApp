import { useEffect, useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatearPesos } from '@/shared/lib/utils'
import { useClientesStore, calcularDeudaTotal, estaEnMora } from '@/clientes'
import type { Cliente } from '@/clientes'
import { FormCliente } from './FormCliente'
import { HistorialComprasSheet } from './HistorialComprasSheet'

export function ListaClientes() {
  const { clientes, cargando, error, cargarClientes, agregarCliente, actualizarCliente, eliminarCliente } =
    useClientesStore()
  const [editando, setEditando] = useState<Cliente | null>(null)
  const [creando, setCreando] = useState(false)
  const [verHistorial, setVerHistorial] = useState<Cliente | null>(null)

  useEffect(() => {
    cargarClientes()
  }, [cargarClientes])

  if (cargando && clientes.length === 0) {
    return (
      <div className="flex flex-col gap-3 p-4">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Clientes</h1>
        <Button size="sm" className="min-h-11" onClick={() => setCreando(true)}>
          + Nuevo
        </Button>
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {creando && (
        <Card className="p-4">
          <FormCliente
            onGuardar={async datos => {
              await agregarCliente(datos)
              setCreando(false)
            }}
          />
        </Card>
      )}

      {editando && (
        <Card className="p-4">
          <FormCliente
            clienteInicial={editando}
            onGuardar={async datos => {
              await actualizarCliente(editando.id, datos)
              setEditando(null)
            }}
          />
        </Card>
      )}

      {clientes.length === 0 && !creando ? (
        <p className="text-center text-muted-foreground py-12">Sin clientes</p>
      ) : (
        <div className="flex flex-col gap-3">
          {clientes.map(cliente => {
            const deuda = calcularDeudaTotal(cliente.cuotas)
            const enMora = estaEnMora(cliente.cuotas)

            return (
              <Card
                key={cliente.id}
                className="p-4 cursor-pointer active:opacity-80 transition-opacity"
                onClick={() => setVerHistorial(cliente)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium truncate">{cliente.nombre}</span>
                      {enMora && (
                        <Badge variant="destructive" className="text-xs shrink-0">
                          En mora
                        </Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">{cliente.telefono}</span>
                    {deuda > 0 && (
                      <span className="text-sm font-medium text-foreground">
                        {formatearPesos(deuda)}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="min-h-11"
                      onClick={e => { e.stopPropagation(); setEditando(cliente) }}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="min-h-11 text-destructive"
                      onClick={e => { e.stopPropagation(); eliminarCliente(cliente.id) }}
                    >
                      Eliminar
                    </Button>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <HistorialComprasSheet
        cliente={verHistorial}
        open={verHistorial !== null}
        onClose={() => setVerHistorial(null)}
      />
    </div>
  )
}
