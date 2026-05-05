import { create } from 'zustand'
import { InventarioService } from './inventario.service'
import { stockBajo } from './inventario.utils'
import type { Producto, CrearProducto, RegistrarCompra, ActualizarProducto } from './inventario.types'

interface InventarioState {
  productos: Producto[]
  cargando: boolean
  error: string | null

  cargarProductos: () => Promise<void>
  agregarProducto: (datos: CrearProducto) => Promise<void>
  actualizarProducto: (id: string, datos: ActualizarProducto) => Promise<void>
  registrarCompra: (datos: RegistrarCompra) => Promise<void>
  productosConStockBajo: () => Producto[]
}

export const useInventarioStore = create<InventarioState>((set, get) => ({
  productos: [],
  cargando: false,
  error: null,

  cargarProductos: async () => {
    set({ cargando: true, error: null })
    try {
      const datos = await InventarioService.obtenerTodos()
      set({ productos: datos, cargando: false })
    } catch {
      set({ error: 'No se pudieron cargar los productos', cargando: false })
    }
  },

  agregarProducto: async (datos) => {
    set({ cargando: true, error: null })
    try {
      const nuevo = await InventarioService.crearProducto(datos)
      set(state => ({ productos: [nuevo, ...state.productos], cargando: false }))
    } catch {
      set({ error: 'No se pudo guardar el producto', cargando: false })
    }
  },

  actualizarProducto: async (id, datos) => {
    set({ cargando: true, error: null })
    try {
      const actualizado = await InventarioService.actualizarProducto(id, datos)
      set(state => ({
        productos: state.productos.map(p => p.id === id ? actualizado : p),
        cargando: false,
      }))
    } catch {
      set({ error: 'No se pudo actualizar el producto', cargando: false })
    }
  },

  registrarCompra: async (datos) => {
    set({ cargando: true, error: null })
    try {
      await InventarioService.registrarCompra(datos)
      await get().cargarProductos()
    } catch {
      set({ error: 'No se pudo registrar la compra', cargando: false })
    }
  },

  productosConStockBajo: () => get().productos.filter(stockBajo),
}))
