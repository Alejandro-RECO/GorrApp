import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/auth'

export function LoginPage() {
  const { loginConGoogle, cargando } = useAuthStore()

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            GorrApp
          </h1>
          <p className="text-sm text-muted-foreground">
            Control de ventas y cobros
          </p>
        </div>

        <Button
          size="lg"
          className="w-full min-h-12"
          onClick={loginConGoogle}
          disabled={cargando}
        >
          Ingresar con Google
        </Button>
      </div>
    </div>
  )
}
