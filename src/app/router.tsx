import { Routes, Route, useParams } from 'react-router-dom'
import { ListaClientes, DetalleCliente } from '@/clientes'
import { ListaVentas, FormVenta } from '@/ventas'

function ClienteConHistorial() {
  const { id } = useParams<{ id: string }>()
  return <DetalleCliente historial={<ListaVentas clienteId={id} />} />
}

export const RUTAS = {
  inicio: "/",
  ventas: {
    lista: "/ventas",
    nueva: "/ventas/nueva",
    detalle: (id: string) => `/ventas/${id}`,
  },
  clientes: {
    lista: "/clientes",
    nuevo: "/clientes/nuevo",
    detalle: (id: string) => `/clientes/${id}`,
  },
  cobros: {
    lista: "/cobros",
    detalle: (id: string) => `/cobros/${id}`,
  },
  caja: {
    resumen: "/caja",
    movimientos: "/caja/movimientos",
  },
  inventario: {
    lista: "/inventario",
    nuevo: "/inventario/nuevo",
  },
  reportes: {
    inicio: "/reportes",
  },
  auth: {
    login: "/login",
  },
} as const

export function AppRoutes() {
  return (
    <Routes>
      <Route path={RUTAS.clientes.lista} element={<ListaClientes />} />
      <Route path={`${RUTAS.clientes.lista}/:id`} element={<ClienteConHistorial />} />
      <Route path={RUTAS.ventas.lista} element={<ListaVentas />} />
      <Route path={RUTAS.ventas.nueva} element={<FormVenta />} />
    </Routes>
  )
}
