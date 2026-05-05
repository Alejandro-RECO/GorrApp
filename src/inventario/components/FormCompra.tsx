import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { formatearPesos } from '@/shared/lib/utils'
import { useInventarioStore, type Producto, type MedioPago } from '@/inventario'

interface Props {
  open: boolean
  producto: Producto
  onClose: () => void
}

export function FormCompra({ open, producto, onClose }: Props) {
  const { registrarCompra, cargando } = useInventarioStore()
  const [cantidad, setCantidad] = useState('')
  const [precioCompra, setPrecioCompra] = useState('')
  const [medio, setMedio] = useState<MedioPago>('efectivo')
  const [confirmar, setConfirmar] = useState(false)

  const cantidadNum = parseInt(cantidad) || 0
  const precioNum = parseInt(precioCompra) || 0
  const total = cantidadNum * precioNum
  const invalido = cantidadNum <= 0 || precioNum <= 0

  const reset = () => {
    setCantidad('')
    setPrecioCompra('')
    setMedio('efectivo')
    setConfirmar(false)
  }

  const handleClose = () => { reset(); onClose() }

  const handleSubmit = async () => {
    if (invalido) return
    const fecha = new Date().toISOString().split('T')[0]
    await registrarCompra({
      producto_id: producto.id,
      cantidad: cantidadNum,
      precio_unitario: precioNum,
      medio_pago: medio,
      fecha,
    })
    handleClose()
  }

  if (confirmar) {
    return (
      <Dialog open={open} onOpenChange={o => !o && handleClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar compra</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3 py-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Producto</span>
              <span className="font-medium">{producto.nombre}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Cantidad</span>
              <span className="font-medium tabular-nums">{cantidadNum} unidades</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Precio unitario</span>
              <span className="font-medium tabular-nums">{formatearPesos(precioNum)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Medio de pago</span>
              <span className="font-medium capitalize">{medio}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total a pagar</span>
              <span className="tabular-nums text-destructive">{formatearPesos(total)}</span>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmar(false)} className="min-h-11">
              Atrás
            </Button>
            <Button onClick={handleSubmit} disabled={cargando} className="min-h-11">
              {cargando ? 'Guardando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={o => !o && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar compra</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-1 pb-1 text-sm">
          <p className="font-medium">{producto.nombre}</p>
          <p className="text-muted-foreground">
            Stock actual:{' '}
            <span className="font-semibold tabular-nums text-foreground">
              {producto.stock_actual}
            </span>{' '}
            unidades
          </p>
        </div>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="compra-cantidad">Cantidad comprada</Label>
            <Input
              id="compra-cantidad"
              type="number"
              value={cantidad}
              onChange={e => setCantidad(e.target.value)}
              placeholder="0"
              className="min-h-11"
              min={1}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="compra-precio">Precio por unidad ($)</Label>
            <Input
              id="compra-precio"
              type="number"
              value={precioCompra}
              onChange={e => setPrecioCompra(e.target.value)}
              placeholder="0"
              className="min-h-11"
              min={1}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Medio de pago</Label>
            <Select value={medio} onValueChange={v => setMedio(v as MedioPago)}>
              <SelectTrigger className="min-h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="efectivo">Efectivo</SelectItem>
                <SelectItem value="digital">Digital</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {total > 0 && (
            <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3 text-sm">
              <span className="text-muted-foreground">Total a pagar</span>
              <span className="font-semibold tabular-nums">{formatearPesos(total)}</span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} className="min-h-11">
            Cancelar
          </Button>
          <Button
            onClick={() => setConfirmar(true)}
            disabled={invalido}
            className="min-h-11"
          >
            Continuar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
