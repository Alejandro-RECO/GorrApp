import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { formatearPesos } from '@/shared/lib/utils'
import { generarMensajeCobro } from '@/cobros'
import type { CuotaConCliente } from '@/cobros'

interface Props {
  cuota: CuotaConCliente
  onClose: () => void
}

export function MensajeCobro({ cuota, onClose }: Props) {
  const [copiado, setCopiado] = useState(false)

  const cliente = cuota.ventas?.clientes
  const mensaje = generarMensajeCobro(
    { nombre: cliente?.nombre || '', telefono: cliente?.telefono || '' },
    [cuota]
  )

  const handleCopiar = async () => {
    await navigator.clipboard.writeText(mensaje)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose()
  }

  const telefono = cliente?.telefono || ''
  const mensajeWhatsApp = `https://wa.me/57${telefono.replace(/\D/g, '')}?text=${encodeURIComponent(mensaje)}`

  return (
    <Dialog open={true} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Mensaje para WhatsApp</DialogTitle>
          <DialogDescription>
            Copia el mensaje o envía directamente por WhatsApp
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-2">
            <Label>Cliente</Label>
            <p className="font-medium">{cliente?.nombre || 'Sin cliente'}</p>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Teléfono</Label>
            <p className="text-muted-foreground">{telefono}</p>
          </div>

          <div className="flex flex-col gap-2">
            <Label>Mensaje</Label>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm whitespace-pre-wrap">{mensaje}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCopiar}
              className="flex-1 min-h-11"
            >
              {copiado ? '¡Copiado!' : 'Copiar'}
            </Button>
            <Button
              asChild
              className="flex-1 min-h-11"
            >
              <a
                href={mensajeWhatsApp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center h-full"
              >
                Enviar
              </a>
            </Button>
          </div>
        </div>

      </DialogContent>
    </Dialog>
  )
}