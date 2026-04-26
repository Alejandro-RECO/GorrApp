import { NavLink } from 'react-router-dom'
import { Users, ShoppingBag, LayoutDashboard } from 'lucide-react'
import { cn } from '@/lib/utils'
import { RUTAS } from './router'

const items = [
  { to: RUTAS.inicio, label: 'Inicio', Icon: LayoutDashboard },
  { to: RUTAS.clientes.lista, label: 'Clientes', Icon: Users },
  { to: RUTAS.ventas.lista, label: 'Ventas', Icon: ShoppingBag },
]

export function NavBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-around px-2">
        {items.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === RUTAS.inicio}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-0.5 rounded-xl px-4 py-2 text-xs font-medium transition-colors min-w-[72px]',
                isActive
                  ? 'text-primary bg-primary/8'
                  : 'text-muted-foreground hover:text-foreground'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('size-5', isActive && 'text-primary')} strokeWidth={isActive ? 2.5 : 1.8} />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
