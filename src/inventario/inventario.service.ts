import { supabase } from '@/shared/lib/supabase'
import type { Producto, CompraInventario, CrearProducto, RegistrarCompra, ActualizarProducto } from './inventario.types'

export const InventarioService = {
  async obtenerTodos(): Promise<Producto[]> {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return (data || []) as Producto[]
  },

  async crearProducto(datos: CrearProducto): Promise<Producto> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    const { data, error } = await supabase
      .from('productos')
      .insert({ ...datos, user_id: user.id, activo: true })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as Producto
  },

  async actualizarProducto(id: string, datos: ActualizarProducto): Promise<Producto> {
    const { data, error } = await supabase
      .from('productos')
      .update(datos)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data as Producto
  },

  async registrarCompra(datos: RegistrarCompra): Promise<CompraInventario> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('No autenticado')

    // 1. Insert en compras_inventario
    const { data: compra, error: compraError } = await supabase
      .from('compras_inventario')
      .insert({
        user_id: user.id,
        producto_id: datos.producto_id,
        cantidad: datos.cantidad,
        precio_compra: datos.precio_unitario,
        total: datos.cantidad * datos.precio_unitario,
        proveedor: datos.proveedor ?? null,
        notas: datos.notas ?? null,
      })
      .select()
      .single()

    if (compraError) throw new Error(compraError.message)

    // 2. Leer stock actual y actualizar en productos
    const { data: productoActual, error: leerError } = await supabase
      .from('productos')
      .select('stock_actual')
      .eq('id', datos.producto_id)
      .single()

    if (leerError) throw new Error(leerError.message)

    const nuevoStock = ((productoActual as Producto | null)?.stock_actual ?? 0) + datos.cantidad

    const { error: updateError } = await supabase
      .from('productos')
      .update({ stock_actual: nuevoStock })
      .eq('id', datos.producto_id)
      .select()
      .single()

    if (updateError) throw new Error(updateError.message)

    // 3. Registrar movimiento en caja tipo compra_mercancia
    const { error: movError } = await supabase
      .from('movimientos_caja')
      .insert({
        user_id: user.id,
        tipo: 'compra_mercancia',
        valor: datos.cantidad * datos.precio_unitario,
        medio_pago: datos.medio_pago,
        fecha: datos.fecha,
        descripcion: `Compra mercancía: ${datos.cantidad} unidades`,
      })
      .select()
      .single()

    if (movError) throw new Error(movError.message)

    return compra as CompraInventario
  },
}
