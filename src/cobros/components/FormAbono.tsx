import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { formatearPesos } from '@/shared/lib/utils'
import { useCobrosStore, calcularSaldoPendiente } from '@/cobros'
import type { CuotaConCliente } from '@/cobros'
import { useEffect } from 'react'

interface Props {
  cuota: CuotaConCliente
  onClose: () => void
  onAbonado: () => void
}

export function FormAbono({ cuota, onClose, onAbonado }: Props) {
  const { registrarAbono, abonos, cargarAbonos, cargando, error } = useCobrosStore()
  const [valor, setValor] = useState('')
  const [medioPago, setMedioPago] = useState<'efectivo' | 'digital'>('efectivo')

  useEffect(() => {
    cargarAbonos(cuota.id)
  }, [cuota.id, cargarAbonos])

  const cuotaAbonos = abonos[cuota.id] || []
  const saldoPendiente = calcularSaldoPendiente(cuota, cuotaAbonos)
  const valorNumber = parseInt(valor) || 0

  const handleSubmit = async () => {
    if (valorNumber <= 0 || valorNumber > saldoPendiente) return

    await registrarAbono({
      cuotaId: cuota.id,
      valor: valorNumber,
      medioPago,
    })
    onAbonado()
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) onClose()
  }

  return (
    <Dialog open={true} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Abono</DialogTitle>
          <DialogDescription>
            Cliente: {cuota.ventas?.clientes?.nombre}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <div className="flex flex-col gap-1">
            <Label>Saldo pendiente</Label>
            <p className="text-lg font-medium">{formatearPesos(saldoPendiente)}</p>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="valor">Valor del abono</Label>
            <Input
              id="valor"
              type="number"
              value={valor}
              onChange={e => setValor(e.target.value)}
              placeholder="0"
              className="min-h-11"
            />
            {valorNumber > saldoPendiente && (
              <p className="text-xs text-destructive">El abono no puede exceder el saldo pendiente</p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label>Medio de pago</Label>
            <Select value={medioPago} onValueChange={v => setMedioPago(v as 'efectivo' | 'digital')}>
              <SelectTrigger className="min-h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="efectivo">Efectivo</SelectItem>
                <SelectItem value="digital">Digital</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="min-h-11">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={valorNumber <= 0 || valorNumber > saldoPendiente || cargando}
            className="min-h-11"
          >
            {cargando ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}