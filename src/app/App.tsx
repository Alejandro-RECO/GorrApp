import { useEffect } from 'react'
import { useAuthStore } from '@/auth'
import { LoginPage } from '@/auth/components/LoginPage'
import { NegocioGuard } from '@/auth/components/NegocioGuard'
import { Navbar } from '@/shared/components/layout/Navbar'
import { Skeleton } from '@/components/ui/skeleton'
import { Toaster } from '@/components/ui/sonner'
import { supabase } from '@/shared/lib/supabase'
import { iniciarNotificaciones, detenerNotificaciones } from '@/notificaciones'
import { AppRoutes } from './router'

function App() {
  const { session, cargando, profile } = useAuthStore()
  const inicializarSesion = useAuthStore(s => s.inicializarSesion)

  useEffect(() => {
    inicializarSesion()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        supabase.auth.stopAutoRefresh()
      } else {
        supabase.auth.startAutoRefresh()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  // Iniciar/detener suscripciones Realtime cuando cambia sesión o negocio
  useEffect(() => {
    if (session?.user && profile?.negocio_id) {
      iniciarNotificaciones(profile.negocio_id, session.user.id)
    }
    return () => detenerNotificaciones()
  }, [session?.user?.id, profile?.negocio_id])

  if (cargando) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col gap-3 w-64">
          <Skeleton className="h-10 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-xl" />
          <Skeleton className="h-8 w-3/4 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!session) {
    return <LoginPage />
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <NegocioGuard>
        <Navbar />
        <main className="mx-auto max-w-screen-lg">
          <AppRoutes />
        </main>
      </NegocioGuard>
      <Toaster position="bottom-center" richColors />
    </div>
  )
}

export default App
