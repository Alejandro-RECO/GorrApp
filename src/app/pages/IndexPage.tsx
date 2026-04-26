import { Link } from 'react-router-dom'
import {
  ShoppingBag, Users, Wallet, Bell, Package, BarChart3, Plus,
} from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { RUTAS } from '../routes'

const MODULOS = [
  {
    to: RUTAS.ventas.lista,
    label: 'Ventas',
    descripcion: 'Historial de ventas',
    Icon: ShoppingBag,
    color: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    to: RUTAS.clientes.lista,
    label: 'Clientes',
    descripcion: 'Ver y gestionar',
    Icon: Users,
    color: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    to: RUTAS.caja.resumen,
    label: 'Caja',
    descripcion: 'Efectivo y digital',
    Icon: Wallet,
    color: 'bg-violet-100 dark:bg-violet-900/30',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
  {
    to: RUTAS.cobros.lista,
    label: 'Cobros',
    descripcion: 'Cuotas pendientes',
    Icon: Bell,
    color: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    to: RUTAS.inventario.lista,
    label: 'Inventario',
    descripcion: 'Stock de gorras',
    Icon: Package,
    color: 'bg-rose-100 dark:bg-rose-900/30',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
  {
    to: RUTAS.reportes.inicio,
    label: 'Reportes',
    descripcion: 'Resumen del negocio',
    Icon: BarChart3,
    color: 'bg-slate-100 dark:bg-slate-800/50',
    iconColor: 'text-slate-600 dark:text-slate-400',
  },
] as const

export function IndexPage() {
  return (
    <div className="flex flex-col gap-6 p-4">
      <div className="pt-2">
        <h1 className="text-2xl font-bold tracking-tight">Panel de control</h1>
        <p className="text-sm text-muted-foreground mt-0.5">¿Qué vas a hacer hoy?</p>
      </div>

      {/* CTA principal — Link styled as Button (base-ui no soporta asChild) */}
      <Link
        to={RUTAS.ventas.nueva}
        className={cn(
          buttonVariants({ size: 'lg' }),
          'w-full min-h-14 text-base font-semibold gap-2'
        )}
      >
        <Plus className="size-5" />
        Registrar nueva venta
      </Link>

      {/* Grid módulos — Link styled as Card (base-ui Card no soporta asChild) */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {MODULOS.map(({ to, label, descripcion, Icon, color, iconColor }) => (
          <Link
            key={to}
            to={to}
            className="flex flex-col gap-2 rounded-xl bg-card p-4 text-sm text-card-foreground ring-1 ring-foreground/10 cursor-pointer hover:bg-accent transition-colors active:scale-[0.98]"
          >
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${color}`}>
              <Icon className={`size-5 ${iconColor}`} />
            </div>
            <div>
              <p className="font-semibold text-sm">{label}</p>
              <p className="text-xs text-muted-foreground">{descripcion}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
