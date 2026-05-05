import { useEffect, useState } from 'react'
import { Plus, ShoppingCart } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { formatearPesos } from '@/shared/lib/utils'
import { useInventarioStore, stockBajo, type Producto } from '@/inventario'
import { FormProducto } from './FormProducto'
import { FormCompra } from './FormCompra'

export function ListaProductos() {
  const { productos, cargando, error, cargarProductos } = useInventarioStore()
  const [formNuevoAbierto, setFormNuevoAbierto] = useState(false)
  const [productoEditar, setProductoEditar] = useState<Producto | null>(null)
  const [productoCompra, setProductoCompra] = useState<Producto | null>(null)

  useEffect(() => {
    cargarProductos()
  }, [cargarProductos])

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Inventario</h1>
        <Button
          size="sm"
          className="min-h-9 gap-1.5"
          onClick={() => setFormNuevoAbierto(true)}
        >
          <Plus className="size-4" />
          Nuevo producto
        </Button>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {cargando && productos.length === 0 ? (
        <div className="flex flex-col gap-2">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : productos.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground py-10">
          Sin productos registrados
        </p>
      ) : (
        <div className="rounded-xl overflow-hidden ring-1 ring-foreground/10">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Producto</TableHead>
                <TableHead className="text-right w-24">Precio</TableHead>
                <TableHead className="text-right w-20">Stock</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {productos.map(p => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span className="font-medium text-sm">{p.nombre}</span>
                      {stockBajo(p) && (
                        <Badge variant="destructive" className="w-fit text-xs py-0">
                          Stock bajo
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-sm tabular-nums">
                    {formatearPesos(p.precio_venta)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={`text-sm tabular-nums font-semibold ${
                        stockBajo(p) ? 'text-destructive' : ''
                      }`}
                    >
                      {p.stock_actual}
                    </span>
                    <span className="text-xs text-muted-foreground"> /{p.stock_minimo}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-h-11 gap-1 text-xs"
                      onClick={() => setProductoCompra(p)}
                    >
                      <ShoppingCart className="size-3" />
                      Compra
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <FormProducto
        open={formNuevoAbierto || productoEditar !== null}
        producto={productoEditar}
        onClose={() => {
          setFormNuevoAbierto(false)
          setProductoEditar(null)
        }}
      />

      {productoCompra && (
        <FormCompra
          open
          producto={productoCompra}
          onClose={() => setProductoCompra(null)}
        />
      )}
    </div>
  )
}
