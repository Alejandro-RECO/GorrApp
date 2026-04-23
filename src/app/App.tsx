import { useEffect } from 'react'
import { useAuthStore } from '@/auth'
import { LoginPage } from '@/auth/components/LoginPage'
import { AppRoutes } from './router'

function App() {
  const { session, inicializarSesion } = useAuthStore()

  useEffect(() => {
    inicializarSesion()
  }, [inicializarSesion])

  if (!session) {
    return <LoginPage />
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppRoutes />
    </div>
  )
}

export default App
