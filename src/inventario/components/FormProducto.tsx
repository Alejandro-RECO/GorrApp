import { useState, useEffect } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useInventarioStore, type Producto } from '@/inventario'

interface Props {
  open: boolean
  producto?: Producto | null
  onClose: () => void
}

export function FormProducto({ open, producto, onClose }: Props) {
  const { agregarProducto, actualizarProducto, cargando } = useInventarioStore()
  const [nombre, setNombre] = useState('')
  const [precioVenta, setPrecioVenta] = useState('')
  const [stockMinimo, setStockMinimo] = useState('5')

  useEffect(() => {
    if (producto) {
      setNombre(producto.nombre)
      setPrecioVenta(String(producto.precio_venta))
      setStockMinimo(String(producto.stock_minimo))
    } else {
      setNombre('')
      setPrecioVenta('')
      setStockMinimo('5')
    }
  }, [producto, open])

  const precioNum = parseInt(precioVenta) || 0
  const stockMin = parseInt(stockMinimo) || 0
  const invalido = !nombre.trim() || precioNum <= 0 || stockMin < 0

  const handleClose = () => {
    setNombre('')
    setPrecioVenta('')
    setStockMinimo('5')
    onClose()
  }

  const handleSubmit = async () => {
    if (invalido) return
    if (producto) {
      await actualizarProducto(producto.id, {
        nombre: nombre.trim(),
        precio_venta: precioNum,
        stock_minimo: stockMin,
      })
    } else {
      await agregarProducto({
        nombre: nombre.trim(),
        precio_venta: precioNum,
        stock_minimo: stockMin,
      })
    }
    handleClose()
  }

  const esEdicion = !!producto

  return (
    <Dialog open={open} onOpenChange={o => !o && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{esEdicion ? 'Editar producto' : 'Nuevo producto'}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="prod-nombre">Nombre</Label>
            <Input
              id="prod-nombre"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Ej: Gorra New Era"
              className="min-h-11"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="prod-precio">Precio de venta ($)</Label>
            <Input
              id="prod-precio"
              type="number"
              value={precioVenta}
              onChange={e => setPrecioVenta(e.target.value)}
              placeholder="0"
              className="min-h-11"
              min={1}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="prod-stock-min">Stock mínimo</Label>
            <Input
              id="prod-stock-min"
              type="number"
              value={stockMinimo}
              onChange={e => setStockMinimo(e.target.value)}
              placeholder="5"
              className="min-h-11"
              min={0}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} className="min-h-11">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={invalido || cargando}
            className="min-h-11"
          >
            {cargando ? 'Guardando...' : esEdicion ? 'Guardar cambios' : 'Crear producto'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
