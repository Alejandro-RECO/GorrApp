import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { formatearPesos } from '@/shared/lib/utils'
import { useClientesStore } from '@/clientes'
import { useVentasStore, calcularCuotas } from '@/ventas'
import type { TipoVenta, MedioPago } from '@/ventas'
import { RUTAS } from '@/app/routes'

type Paso = 1 | 2 | 3

export function FormVenta() {
  const navigate = useNavigate()

  const { clientes, cargando: cargandoClientes, cargarClientes } = useClientesStore()
  const { agregarVenta, cargando: enviando } = useVentasStore()

  const [paso, setPaso] = useState<Paso>(1)
  const [clienteId, setClienteId] = useState('')
  const [totalPesos, setTotalPesos] = useState('')
  const [tipo, setTipo] = useState<TipoVenta>('contado')
  const [medioPago, setMedioPago] = useState<MedioPago>('efectivo')
  const [notas, setNotas] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (clientes.length === 0) cargarClientes()
  }, [clientes.length, cargarClientes])

  const clienteSeleccionado = clientes.find(c => c.id === clienteId)
  const totalCentavos = Math.round(parseFloat(totalPesos || '0'))
  const cuotasPreview = calcularCuotas({
    total: totalCentavos,
    tipo,
    fechaVenta: new Date(),
  })

  const handleSiguiente = () => {
    if (paso === 1 && !clienteId) {
      setError('Selecciona un cliente')
      return
    }
    if (paso === 2) {
      if (!totalPesos || parseFloat(totalPesos) <= 0) {
        setError('El total debe ser mayor a 0')
        return
      }
    }
    setError(null)
    setPaso(p => (p < 3 ? ((p + 1) as Paso) : p))
  }

  const handleConfirmar = async () => {
    setError(null)
    try {
      await agregarVenta({
        cliente_id: clienteId,
        total: totalCentavos,
        tipo,
        medio_pago: medioPago,
        notas: notas.trim() || null,
      })
      navigate(RUTAS.ventas.lista)
    } catch {
      setError('No se pudo registrar la venta. Intenta de nuevo.')
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold">Nueva venta</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Paso {paso} de 3
        </p>
      </div>

      {/* Step indicators */}
      <div className="flex gap-2">
        {([1, 2, 3] as Paso[]).map(n => (
          <div
            key={n}
            className={`h-1 flex-1 rounded-full transition-colors ${
              n <= paso ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* PASO 1 — Cliente */}
      {paso === 1 && (
        <div className="flex flex-col gap-3">
          <Label className="text-base font-medium">¿A quién le vendes?</Label>

          {cargandoClientes && clientes.length === 0 ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-11 w-full rounded-lg" />)}
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-72 overflow-y-auto">
              {clientes.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => { setClienteId(c.id); setError(null) }}
                  className={`flex flex-col gap-0.5 rounded-lg border px-4 py-3 text-left transition-colors min-h-11 ${
                    clienteId === c.id
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border hover:bg-accent'
                  }`}
                >
                  <span className="font-medium text-sm">{c.nombre}</span>
                  <span className="text-xs text-muted-foreground">{c.telefono}</span>
                </button>
              ))}
              {clientes.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Sin clientes registrados
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* PASO 2 — Monto y tipo */}
      {paso === 2 && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="total">Total (pesos)</Label>
            <Input
              id="total"
              type="number"
              inputMode="decimal"
              placeholder="0"
              value={totalPesos}
              onChange={e => setTotalPesos(e.target.value)}
              className="min-h-11 text-lg"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tipo">Tipo de venta</Label>
            <Select
              value={tipo}
              onValueChange={(value: string | null) =>
                value && setTipo(value as TipoVenta)
              }
            >
              <SelectTrigger id="tipo" className="min-h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="contado">Contado</SelectItem>
                <SelectItem value="fiado_una_cuota">Fiado — 1 cuota (30 días)</SelectItem>
                <SelectItem value="fiado_dos_cuotas">Fiado — 2 cuotas (15 y 30 días)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="medio">Medio de pago</Label>
            <Select
              value={medioPago}
              onValueChange={(v) => v && setMedioPago(v as MedioPago)}
            >
              <SelectTrigger id="medio" className="min-h-11 w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="efectivo">Efectivo</SelectItem>
                <SelectItem value="digital">Digital (Nequi / Bancolombia)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="notas">Notas <span className="text-muted-foreground font-normal">(opcional)</span></Label>
            <Textarea
              id="notas"
              placeholder="Ej: gorras negras talla M, cliente preguntó por descuento..."
              value={notas}
              onChange={e => setNotas(e.target.value)}
              className="resize-none"
              rows={3}
            />
          </div>
        </div>
      )}

      {/* PASO 3 — Resumen */}
      {paso === 3 && (
        <Card className="p-4 flex flex-col gap-3">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Cliente</p>
            <p className="font-semibold">{clienteSeleccionado?.nombre}</p>
          </div>

          <Separator />

          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Total</p>
            <p className="text-xl font-bold">{formatearPesos(totalCentavos)}</p>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Tipo</p>
            <p className="text-sm font-medium capitalize">
              {tipo === 'contado' ? 'Contado' : tipo === 'fiado_una_cuota' ? 'Fiado 1 cuota' : 'Fiado 2 cuotas'}
            </p>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">Pago</p>
            <p className="text-sm font-medium capitalize">{medioPago}</p>
          </div>

          {notas.trim() && (
            <>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Notas</p>
                <p className="text-sm">{notas.trim()}</p>
              </div>
            </>
          )}

          {cuotasPreview.length > 0 && (
            <>
              <Separator />
              <div className="flex flex-col gap-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Cuotas</p>
                {cuotasPreview.map(c => (
                  <div key={c.numero_cuota} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Cuota {c.numero_cuota}</span>
                    <div className="text-right">
                      <span className="font-medium">{(formatearPesos(c.valor))}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        vence {c.fecha_vencimiento}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      )}

      {/* Navigation buttons */}
      <div className="flex gap-3 mt-2">
        {paso > 1 && (
          <Button
            type="button"
            variant="outline"
            className="flex-1 min-h-11"
            onClick={() => { setError(null); setPaso(p => (p - 1) as Paso) }}
            disabled={enviando}
          >
            Anterior
          </Button>
        )}

        {paso < 3 ? (
          <Button
            type="button"
            className="flex-1 min-h-11"
            onClick={handleSiguiente}
          >
            Siguiente
          </Button>
        ) : (
          <Button
            type="button"
            className="flex-1 min-h-11 font-semibold"
            onClick={handleConfirmar}
            disabled={enviando}
          >
            {enviando ? 'Registrando...' : 'Confirmar venta'}
          </Button>
        )}
      </div>
    </div>
  )
}
