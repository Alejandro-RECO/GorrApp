import { Routes, Route, useParams } from 'react-router-dom'
import { ListaClientes, DetalleCliente } from '@/clientes'
import { ListaVentas, FormVenta } from '@/ventas'
import { IndexPage } from './pages/IndexPage'

function ClienteConHistorial() {
  const { id } = useParams<{ id: string }>()
  return <DetalleCliente historial={<ListaVentas clienteId={id} />} />
}

function PlaceholderPage({ titulo }: { titulo: string }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 gap-2 text-center">
      <p className="text-xl font-semibold">{titulo}</p>
      <p className="text-sm text-muted-foreground">Próximamente disponible</p>
    </div>
  )
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
      <Route path={RUTAS.inicio} element={<IndexPage />} />
      <Route path={RUTAS.ventas.lista} element={<ListaVentas />} />
      <Route path={RUTAS.ventas.nueva} element={<FormVenta />} />
      <Route path={RUTAS.clientes.lista} element={<ListaClientes />} />
      <Route path={`${RUTAS.clientes.lista}/:id`} element={<ClienteConHistorial />} />
      <Route path={RUTAS.caja.resumen} element={<PlaceholderPage titulo="Caja" />} />
      <Route path={RUTAS.cobros.lista} element={<PlaceholderPage titulo="Cobros" />} />
      <Route path={RUTAS.inventario.lista} element={<PlaceholderPage titulo="Inventario" />} />
      <Route path={RUTAS.reportes.inicio} element={<PlaceholderPage titulo="Reportes" />} />
    </Routes>
  )
}
