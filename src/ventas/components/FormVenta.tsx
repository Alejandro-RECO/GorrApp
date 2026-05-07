import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Minus, Plus, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { formatearPesos } from '@/shared/lib/utils'
import { useClientesStore } from '@/clientes'
import { useInventarioStore } from '@/inventario'
import { useVentasStore, calcularCuotas } from '@/ventas'
import type { TipoVenta, MedioPago, ProductoVenta } from '@/ventas'
import { RUTAS } from '@/app/routes'

type Paso = 1 | 2 | 3 | 4

export function FormVenta() {
  const navigate = useNavigate()

  const { clientes, cargando: cargandoClientes, cargarClientes } = useClientesStore()
  const { productos, cargando: cargandoProductos, cargarProductos } = useInventarioStore()
  const { agregarVenta, cargando: enviando } = useVentasStore()

  const [paso, setPaso] = useState<Paso>(1)
  const [clienteId, setClienteId] = useState('')
  const [busqueda, setBusqueda] = useState('')

  // Paso 2 — productos
  const [productosSeleccionados, setProductosSeleccionados] = useState<ProductoVenta[]>([])
  const [busquedaProducto, setBusquedaProducto] = useState('')

  // Paso 3 — detalles
  const [totalPesos, setTotalPesos] = useState('')
  const [tipo, setTipo] = useState<TipoVenta>('contado')
  const [medioPago, setMedioPago] = useState<MedioPago>('efectivo')
  const [notas, setNotas] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (clientes.length === 0) cargarClientes()
  }, [clientes.length, cargarClientes])

  useEffect(() => {
    if (paso === 2) cargarProductos()
  }, [paso, cargarProductos])

  const clienteSeleccionado = clientes.find(c => c.id === clienteId)
  const clientesFiltrados = busqueda.trim()
    ? clientes.filter(c =>
        c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        c.telefono.includes(busqueda)
      )
    : clientes

  const productosFiltrados = busquedaProducto.trim()
    ? productos.filter(p =>
        p.nombre.toLowerCase().includes(busquedaProducto.toLowerCase())
      )
    : productos

  const totalCentavos = Math.round(parseFloat(totalPesos || '0'))
  const cuotasPreview = calcularCuotas({
    total: totalCentavos,
    tipo,
    fechaVenta: new Date(),
  })

  const setProductoCantidad = (productoId: string, delta: number, nombre: string, stockActual: number) => {
    setProductosSeleccionados(prev => {
      const existente = prev.find(p => p.producto_id === productoId)
      if (!existente) {
        if (delta <= 0) return prev
        return [...prev, { producto_id: productoId, cantidad: 1, nombre, stock_actual: stockActual }]
      }
      const nuevaCantidad = existente.cantidad + delta
      if (nuevaCantidad <= 0) return prev.filter(p => p.producto_id !== productoId)
      return prev.map(p =>
        p.producto_id === productoId ? { ...p, cantidad: nuevaCantidad } : p
      )
    })
  }

  const setCantidadDirecta = (productoId: string, valor: number, nombre: string, stockActual: number) => {
    if (valor <= 0) {
      setProductosSeleccionados(prev => prev.filter(p => p.producto_id !== productoId))
      return
    }
    setProductosSeleccionados(prev => {
      const existente = prev.find(p => p.producto_id === productoId)
      if (!existente) return [...prev, { producto_id: productoId, cantidad: valor, nombre, stock_actual: stockActual }]
      return prev.map(p => p.producto_id === productoId ? { ...p, cantidad: valor } : p)
    })
  }

  const handleSiguiente = () => {
    if (paso === 1 && !clienteId) {
      setError('Selecciona un cliente')
      return
    }
    if (paso === 3) {
      if (!totalPesos || parseFloat(totalPesos) <= 0) {
        setError('El total debe ser mayor a 0')
        return
      }
    }
    setError(null)
    setPaso(p => (p < 4 ? ((p + 1) as Paso) : p))
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
        productos: productosSeleccionados.map(p => ({
          producto_id: p.producto_id,
          cantidad: p.cantidad,
        })),
      })
      navigate(RUTAS.ventas.lista)
    } catch {
      setError('No se pudo registrar la venta. Intenta de nuevo.')
    }
  }

  const totalPasos = 4

  return (
    <div className="flex flex-col gap-4 p-4 max-w-lg mx-auto">
      <div>
        <h1 className="text-xl font-semibold">Nueva venta</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Paso {paso} de {totalPasos}</p>
      </div>

      <div className="flex gap-2">
        {([1, 2, 3, 4] as Paso[]).map(n => (
          <div
            key={n}
            className={`h-1 flex-1 rounded-full transition-colors ${
              n <= paso ? 'bg-primary' : 'bg-muted'
            }`}
          />
        ))}
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {/* PASO 1 — Cliente */}
      {paso === 1 && (
        <div className="flex flex-col gap-3">
          <Label className="text-base font-medium">¿A quién le vendes?</Label>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Buscar por nombre o teléfono..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="pl-9 min-h-11"
            />
          </div>

          {cargandoClientes && clientes.length === 0 ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-0.5">
              {clientesFiltrados.map(c => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => { setClienteId(c.id); setError(null) }}
                  className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors min-h-14 ${
                    clienteId === c.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-accent'
                  }`}
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    clienteId === c.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}>
                    {c.nombre.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    <span className={`font-medium text-sm truncate ${clienteId === c.id ? 'text-primary' : ''}`}>
                      {c.nombre}
                    </span>
                    <span className="text-xs text-muted-foreground">{c.telefono}</span>
                  </div>
                </button>
              ))}
              {clientesFiltrados.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {busqueda ? `Sin resultados para "${busqueda}"` : 'Sin clientes registrados'}
                </p>
              )}
            </div>
          )}

          {clienteId && clienteSeleccionado && (
            <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 px-3 py-2 text-sm">
              <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground shrink-0">
                {clienteSeleccionado.nombre.charAt(0).toUpperCase()}
              </div>
              <span className="font-medium text-primary truncate">{clienteSeleccionado.nombre}</span>
            </div>
          )}
        </div>
      )}

      {/* PASO 2 — Productos */}
      {paso === 2 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Label className="text-base font-medium">¿Qué productos vendiste?</Label>
            {productosSeleccionados.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {productosSeleccionados.reduce((s, p) => s + p.cantidad, 0)} unidades
              </span>
            )}
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Buscar producto..."
              value={busquedaProducto}
              onChange={e => setBusquedaProducto(e.target.value)}
              className="pl-9 min-h-11"
            />
          </div>

          {cargandoProductos && productos.length === 0 ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
            </div>
          ) : (
            <div className="flex flex-col gap-2 max-h-64 overflow-y-auto pr-0.5">
              {productosFiltrados.filter(p => p.activo).map(p => {
                const seleccionado = productosSeleccionados.find(s => s.producto_id === p.id)
                const cantidad = seleccionado?.cantidad ?? 0
                const stockInsuficiente = cantidad > p.stock_actual

                return (
                  <div
                    key={p.id}
                    className={`flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                      cantidad > 0 ? 'border-primary bg-primary/5' : 'border-border'
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{p.nombre}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          Stock: {p.stock_actual}
                        </span>
                        {stockInsuficiente && (
                          <Badge variant="destructive" className="text-[10px] py-0 h-4 gap-0.5">
                            <AlertTriangle className="size-2.5" />
                            Insuficiente
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setProductoCantidad(p.id, -1, p.nombre, p.stock_actual)}
                        disabled={cantidad === 0}
                        className="flex size-8 items-center justify-center rounded-lg border border-border hover:bg-muted disabled:opacity-40 transition-colors"
                      >
                        <Minus className="size-3.5" />
                      </button>
                      <Input
                        type="number"
                        value={cantidad || ''}
                        onChange={e => setCantidadDirecta(p.id, parseInt(e.target.value) || 0, p.nombre, p.stock_actual)}
                        className="w-12 h-8 text-center text-sm p-1"
                        min={0}
                        placeholder="0"
                      />
                      <button
                        onClick={() => setProductoCantidad(p.id, 1, p.nombre, p.stock_actual)}
                        className="flex size-8 items-center justify-center rounded-lg border border-border hover:bg-muted transition-colors"
                      >
                        <Plus className="size-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
              {productosFiltrados.filter(p => p.activo).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">
                  {busquedaProducto ? `Sin resultados para "${busquedaProducto}"` : 'Sin productos en inventario'}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* PASO 3 — Total, tipo y pago */}
      {paso === 3 && (
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

      {/* PASO 4 — Resumen */}
      {paso === 4 && (
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

          {productosSeleccionados.length > 0 && (
            <>
              <Separator />
              <div className="flex flex-col gap-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Productos vendidos</p>
                {productosSeleccionados.map(p => (
                  <div key={p.producto_id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{p.nombre}</span>
                    <span className="font-medium">× {p.cantidad}</span>
                  </div>
                ))}
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
                      <span className="font-medium">{formatearPesos(c.valor)}</span>
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

      {/* Navegación */}
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

        {paso === 2 && productosSeleccionados.length === 0 && (
          <Button
            type="button"
            variant="ghost"
            className="flex-1 min-h-11 text-muted-foreground"
            onClick={() => { setError(null); setPaso(3) }}
          >
            Sin productos
          </Button>
        )}

        {paso < 4 ? (
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
