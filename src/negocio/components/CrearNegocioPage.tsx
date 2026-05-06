import { useState } from 'react'
import { Store } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AuthService } from '@/auth'
import { useAuthStore } from '@/auth'

export function CrearNegocioPage() {
  const { cargarPerfil } = useAuthStore()
  const [nombre, setNombre] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [modoUnirse, setModoUnirse] = useState(false)
  const [codigo, setCodigo] = useState('')

  const handleCrear = async () => {
    if (!nombre.trim()) return
    setCargando(true)
    setError(null)
    try {
      await AuthService.crearNegocioYPerfil(nombre.trim())
      await cargarPerfil()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al crear el negocio')
    } finally {
      setCargando(false)
    }
  }

  const handleUnirse = async () => {
    if (!codigo.trim()) return
    setCargando(true)
    setError(null)
    try {
      await AuthService.unirseConCodigo(codigo.trim())
      await cargarPerfil()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Código inválido o expirado')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-background">
      <div className="flex flex-col gap-6 w-full max-w-sm">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <Store className="size-6 text-primary" />
          </div>
          <h1 className="text-xl font-semibold">Configura tu negocio</h1>
          <p className="text-sm text-muted-foreground">
            {modoUnirse
              ? 'Ingresa el código que te compartió el dueño del negocio.'
              : '¿Cómo se llama tu negocio?'}
          </p>
        </div>

        {!modoUnirse ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="nombre-negocio">Nombre del negocio</Label>
              <Input
                id="nombre-negocio"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
                placeholder="Ej: Gorras Alejandro"
                className="min-h-11"
                onKeyDown={e => e.key === 'Enter' && handleCrear()}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              onClick={handleCrear}
              disabled={!nombre.trim() || cargando}
              className="min-h-11"
            >
              {cargando ? 'Creando...' : 'Crear negocio'}
            </Button>

            <button
              onClick={() => setModoUnirse(true)}
              className="text-sm text-muted-foreground underline underline-offset-2"
            >
              Ya tengo un negocio — unirme con código
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="codigo-inv">Código de invitación</Label>
              <Input
                id="codigo-inv"
                value={codigo}
                onChange={e => setCodigo(e.target.value.toUpperCase())}
                placeholder="Ej: A3XK9P2M"
                className="min-h-11 font-mono tracking-widest text-center text-lg uppercase"
                maxLength={8}
                onKeyDown={e => e.key === 'Enter' && handleUnirse()}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <Button
              onClick={handleUnirse}
              disabled={codigo.length !== 8 || cargando}
              className="min-h-11"
            >
              {cargando ? 'Uniéndome...' : 'Unirme al negocio'}
            </Button>

            <button
              onClick={() => { setModoUnirse(false); setError(null) }}
              className="text-sm text-muted-foreground underline underline-offset-2"
            >
              Crear un negocio nuevo
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
