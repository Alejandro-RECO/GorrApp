import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import {
  Menu, LogOut, Home, ShoppingBag, Users,
  Wallet, Bell, Package, BarChart3, Settings,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger,
} from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/auth'
import { RUTAS } from '@/app/routes'
import { cn } from '@/lib/utils'
import { Link } from 'react-router-dom'

const NAV_LINKS = [
  { to: RUTAS.inicio,           label: 'Inicio',      Icon: Home },
  { to: RUTAS.ventas.lista,     label: 'Ventas',      Icon: ShoppingBag },
  { to: RUTAS.clientes.lista,   label: 'Clientes',    Icon: Users },
  { to: RUTAS.caja.resumen,     label: 'Caja',        Icon: Wallet },
  { to: RUTAS.cobros.lista,     label: 'Cobros',      Icon: Bell },
  { to: RUTAS.inventario.lista, label: 'Inventario',  Icon: Package },
  { to: RUTAS.reportes.inicio,  label: 'Reportes',    Icon: BarChart3 },
] as const

type NavLinkItemProps = {
  to: string
  label: string
  Icon: React.ElementType
  onClick?: () => void
}

function NavLinkItem({ to, label, Icon, onClick }: NavLinkItemProps) {
  return (
    <NavLink
      to={to}
      end={to === RUTAS.inicio}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors min-h-11',
          isActive
            ? 'bg-primary/10 text-primary'
            : 'text-muted-foreground hover:bg-accent hover:text-foreground'
        )
      }
    >
      <Icon className="size-4 shrink-0" />
      {label}
    </NavLink>
  )
}

export function Navbar() {
  const { session, negocio, cerrarSesion } = useAuthStore()
  const [sheetOpen, setSheetOpen] = useState(false)

  const email = session?.user?.email ?? ''
  const inicial = email[0]?.toUpperCase() ?? 'U'

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-3 px-4">
        {/* Mobile hamburger */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger className="md:hidden flex size-9 items-center justify-center rounded-md hover:bg-accent transition-colors">
            <Menu className="size-5" />
            <span className="sr-only">Menú</span>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <SheetHeader className="px-4 pt-5 pb-2">
              <SheetTitle>GorrApp</SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 px-3 pb-4">
              {NAV_LINKS.map(link => (
                <NavLinkItem
                  key={link.to}
                  {...link}
                  onClick={() => setSheetOpen(false)}
                />
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        {/* Logo */}
        <span className="font-bold text-base tracking-tight">GorrApp</span>

        {/* Desktop links */}
        <nav className="hidden md:flex items-center gap-0.5 flex-1 ml-2">
          {NAV_LINKS.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === RUTAS.inicio}
              className={({ isActive }) =>
                cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User menu */}
        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none rounded-full cursor-pointer">
              <Avatar size="sm">
                <AvatarFallback>{inicial}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-52">
              <DropdownMenuGroup>
                <DropdownMenuLabel className="font-normal">
                  {negocio && (
                    <span className="block font-semibold text-foreground text-sm truncate">
                      {negocio.nombre}
                    </span>
                  )}
                  <span className="block text-xs text-muted-foreground truncate">{email}</span>
                </DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to={RUTAS.negocio.configuracion} className="flex items-center gap-2 cursor-pointer">
                  <Settings className="size-4" />
                  Mi negocio
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={cerrarSesion} variant="destructive">
                <LogOut />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
