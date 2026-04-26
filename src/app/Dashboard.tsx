import { Link } from 'react-router-dom'
import { Users, ShoppingBag, Plus, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { RUTAS } from './router'

export function Dashboard() {
  return (
    <div className="flex flex-col gap-6 p-4 pb-24">
      <div className="pt-4">
        <h1 className="text-2xl font-bold tracking-tight">GorrApp</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Panel de control</p>
      </div>

      {/* CTA principal */}
      <Button asChild size="lg" className="w-full min-h-14 text-base font-semibold gap-2">
        <Link to={RUTAS.ventas.nueva}>
          <Plus className="size-5" />
          Registrar nueva venta
        </Link>
      </Button>

      {/* Acceso rápido */}
      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1">
          Acceso rápido
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Card asChild className="p-4 cursor-pointer hover:bg-accent transition-colors active:scale-[0.98]">
            <Link to={RUTAS.clientes.lista}>
              <div className="flex flex-col gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                  <Users className="size-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Clientes</p>
                  <p className="text-xs text-muted-foreground">Ver y gestionar</p>
                </div>
              </div>
            </Link>
          </Card>

          <Card asChild className="p-4 cursor-pointer hover:bg-accent transition-colors active:scale-[0.98]">
            <Link to={RUTAS.ventas.lista}>
              <div className="flex flex-col gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                  <ShoppingBag className="size-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Ventas</p>
                  <p className="text-xs text-muted-foreground">Historial completo</p>
                </div>
              </div>
            </Link>
          </Card>
        </div>
      </section>

      {/* Placeholder métricas */}
      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1">
          Resumen
        </h2>
        <Card className="p-4 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted shrink-0">
            <TrendingUp className="size-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Reportes disponibles en próxima versión
            </p>
          </div>
        </Card>
      </section>
    </div>
  )
}
