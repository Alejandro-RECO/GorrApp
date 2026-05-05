import { Routes, Route, useParams } from 'react-router-dom'
import { ListaClientes, DetalleCliente } from '@/clientes'
import { ListaVentas, FormVenta } from '@/ventas'
import { ListaCobros } from '@/cobros'
import { CajaPage } from '@/caja'
import { ListaProductos } from '@/inventario'
import { IndexPage } from './pages/IndexPage'
import { RUTAS } from './routes'

export { RUTAS } from './routes'

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

export function AppRoutes() {
  return (
    <Routes>
      <Route path={RUTAS.inicio} element={<IndexPage />} />
      <Route path={RUTAS.ventas.lista} element={<ListaVentas />} />
      <Route path={RUTAS.ventas.nueva} element={<FormVenta />} />
      <Route path={RUTAS.clientes.lista} element={<ListaClientes />} />
      <Route path={`${RUTAS.clientes.lista}/:id`} element={<ClienteConHistorial />} />
      <Route path={RUTAS.caja.resumen} element={<CajaPage />} />
      <Route path={RUTAS.cobros.lista} element={<ListaCobros />} />
      <Route path={RUTAS.inventario.lista} element={<ListaProductos />} />
      <Route path={RUTAS.reportes.inicio} element={<PlaceholderPage titulo="Reportes" />} />
    </Routes>
  )
}
