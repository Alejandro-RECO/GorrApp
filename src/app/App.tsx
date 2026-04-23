import { useEffect } from 'react'
import { useAuthStore } from '@/auth'
import { LoginPage } from '@/auth/components/LoginPage'

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
      <h1 className="text-2xl font-bold p-4">GorrApp</h1>
    </div>
  )
}

export default App
