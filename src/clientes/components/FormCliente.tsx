import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { CrearCliente } from '@/clientes'

interface Props {
  onGuardar: (datos: CrearCliente) => void | Promise<void>
  clienteInicial?: Partial<CrearCliente>
}

interface Errores {
  nombre?: string
  telefono?: string
}

export function FormCliente({ onGuardar, clienteInicial }: Props) {
  const [nombre, setNombre] = useState(clienteInicial?.nombre ?? '')
  const [telefono, setTelefono] = useState(clienteInicial?.telefono ?? '')
  const [notas, setNotas] = useState(clienteInicial?.notas ?? '')
  const [errores, setErrores] = useState<Errores>({})
  const [enviando, setEnviando] = useState(false)

  const validar = (): Errores => {
    const e: Errores = {}
    if (!nombre.trim()) e.nombre = 'El nombre es obligatorio'
    if (!telefono.trim()) e.telefono = 'El teléfono es obligatorio'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validar()
    if (Object.keys(errs).length > 0) {
      setErrores(errs)
      return
    }
    setErrores({})
    setEnviando(true)
    try {
      await onGuardar({
        nombre: nombre.trim(),
        telefono: telefono.trim(),
        notas: notas.trim() || null,
      })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nombre">Nombre</Label>
        <Input
          id="nombre"
          value={nombre}
          onChange={e => setNombre(e.target.value)}
          placeholder="Nombre del cliente"
          className="min-h-11"
        />
        {errores.nombre && (
          <p className="text-sm text-destructive">{errores.nombre}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="telefono">Teléfono</Label>
        <Input
          id="telefono"
          value={telefono}
          onChange={e => setTelefono(e.target.value)}
          placeholder="Número de teléfono"
          className="min-h-11"
        />
        {errores.telefono && (
          <p className="text-sm text-destructive">{errores.telefono}</p>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notas">Notas</Label>
        <Input
          id="notas"
          value={notas}
          onChange={e => setNotas(e.target.value)}
          placeholder="Observaciones opcionales"
          className="min-h-11"
        />
      </div>

      <Button type="submit" disabled={enviando} className="min-h-11 w-full">
        Guardar
      </Button>
    </form>
  )
}
