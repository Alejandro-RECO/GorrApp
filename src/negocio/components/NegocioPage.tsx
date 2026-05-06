import { useEffect, useState } from 'react'
import { Copy, Plus, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { useAuthStore } from '@/auth'
import { useNegocioStore } from '@/negocio'

function horasRestantes(expira_at: string): string {
  const diff = new Date(expira_at).getTime() - Date.now()
  const horas = Math.max(0, Math.floor(diff / 3600000))
  return `${horas}h`
}

export function NegocioPage() {
  const { negocio, cargarPerfil } = useAuthStore()
  const { miembros, invitaciones, cargando, cargarMiembros, cargarInvitaciones, generarInvitacion, actualizarNombre } = useNegocioStore()
  const [nombreEdit, setNombreEdit] = useState(negocio?.nombre ?? '')
  const [editandoNombre, setEditandoNombre] = useState(false)

  useEffect(() => {
    cargarMiembros()
    cargarInvitaciones()
  }, [cargarMiembros, cargarInvitaciones])

  useEffect(() => {
    setNombreEdit(negocio?.nombre ?? '')
  }, [negocio?.nombre])

  const handleGuardarNombre = async () => {
    if (!nombreEdit.trim()) return
    await actualizarNombre(nombreEdit.trim())
    await cargarPerfil()
    setEditandoNombre(false)
  }

  const handleGenerarCodigo = async () => {
    await generarInvitacion()
  }

  const copiar = (texto: string) => {
    navigator.clipboard.writeText(texto).catch(() => {})
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <h1 className="text-xl font-semibold">Mi negocio</h1>

      {/* Nombre del negocio */}
      <div className="flex flex-col gap-3 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Nombre</p>
        {editandoNombre ? (
          <div className="flex gap-2">
            <Input
              value={nombreEdit}
              onChange={e => setNombreEdit(e.target.value)}
              className="min-h-11"
              onKeyDown={e => e.key === 'Enter' && handleGuardarNombre()}
            />
            <Button size="sm" onClick={handleGuardarNombre} className="min-h-11">Guardar</Button>
            <Button size="sm" variant="outline" onClick={() => setEditandoNombre(false)} className="min-h-11">Cancelar</Button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">{negocio?.nombre}</span>
            <Button size="sm" variant="outline" onClick={() => setEditandoNombre(true)} className="min-h-11">Editar</Button>
          </div>
        )}
      </div>

      <Separator />

      {/* Miembros */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Users className="size-4 text-muted-foreground" />
          <span className="font-medium text-sm">Miembros ({miembros.length})</span>
        </div>

        {cargando && miembros.length === 0 ? (
          <div className="flex flex-col gap-2">
            {[1, 2].map(i => <Skeleton key={i} className="h-12 w-full rounded-lg" />)}
          </div>
        ) : miembros.length === 0 ? (
          <p className="text-sm text-muted-foreground">Solo tú por ahora.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {miembros.map(m => (
              <div key={m.id} className="flex items-center gap-3 rounded-lg bg-muted/40 px-4 py-3 text-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs">
                  {(m.email ?? '?').charAt(0).toUpperCase()}
                </div>
                <span className="text-sm">{m.email ?? 'Usuario sin email'}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Separator />

      {/* Invitaciones */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm">Códigos de invitación</span>
          <Button size="sm" className="min-h-9 gap-1.5" onClick={handleGenerarCodigo} disabled={cargando}>
            <Plus className="size-4" />
            Generar
          </Button>
        </div>

        {invitaciones.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin códigos activos. Genera uno para invitar a alguien.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {invitaciones.map(inv => (
              <div key={inv.id} className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-3">
                <div className="flex flex-col gap-0.5">
                  <span className="font-mono font-bold tracking-widest text-sm">{inv.codigo}</span>
                  <span className="text-xs text-muted-foreground">Expira en {horasRestantes(inv.expira_at)}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="size-9 p-0"
                  onClick={() => copiar(inv.codigo)}
                  title="Copiar código"
                >
                  <Copy className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          El empleado debe ingresar con su cuenta de Google y luego ingresar este código.
        </p>
      </div>
    </div>
  )
}
