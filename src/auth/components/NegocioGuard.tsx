import { useLocation } from 'react-router-dom'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuthStore } from '@/auth'
import { CrearNegocioPage } from '@/negocio'

interface Props {
  children: React.ReactNode
}

export function NegocioGuard({ children }: Props) {
  const { profile, cargando } = useAuthStore()
  const location = useLocation()

  if (cargando) {
    return (
      <div className="flex flex-col gap-3 p-6">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    )
  }

  // Sin profile: nuevo usuario — mostrar onboarding
  // Excepción: /negocio/unirse permite entrar sin profile
  if (!profile && !location.pathname.startsWith('/negocio/unirse')) {
    return <CrearNegocioPage />
  }

  return <>{children}</>
}
