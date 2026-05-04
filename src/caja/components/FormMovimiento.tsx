import { useState } from 'react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select'
import { useCajaStore, type TipoMovimiento, type MedioPago } from '@/caja'

const TIPO_LABELS: Record<TipoMovimiento, string> = {
  ingreso_venta:    'Ingreso de venta',
  ingreso_abono:    'Ingreso de abono',
  gasto_operativo:  'Gasto operativo',
  gasto_inversion:  'Gasto de inversión',
  compra_mercancia: 'Compra de mercancía',
}

interface Props {
  open: boolean
  onClose: () => void
}

export function FormMovimiento({ open, onClose }: Props) {
  const { registrarMovimiento, cargando, fechaActiva } = useCajaStore()
  const [tipo, setTipo] = useState<TipoMovimiento>('ingreso_venta')
  const [valor, setValor] = useState('')
  const [medio, setMedio] = useState<MedioPago>('efectivo')
  const [descripcion, setDescripcion] = useState('')

  const valorNum = parseInt(valor) || 0
  const invalido = valorNum <= 0 || !descripcion.trim()

  const reset = () => {
    setValor('')
    setDescripcion('')
    setTipo('ingreso_venta')
    setMedio('efectivo')
  }

  const handleClose = () => { reset(); onClose() }

  const handleSubmit = async () => {
    if (invalido) return
    await registrarMovimiento({
      tipo,
      valor: valorNum,
      medioPago: medio,
      fecha: fechaActiva,
      descripcion: descripcion.trim(),
    })
    handleClose()
  }

  return (
    <Dialog open={open} onOpenChange={o => !o && handleClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar movimiento</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          <div className="flex flex-col gap-2">
            <Label>Tipo</Label>
            <Select value={tipo} onValueChange={v => setTipo(v as TipoMovimiento)}>
              <SelectTrigger className="min-h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(TIPO_LABELS) as [TipoMovimiento, string][]).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="mov-valor">Valor ($)</Label>
            <Input
              id="mov-valor"
              type="number"
              value={valor}
              onChange={e => setValor(e.target.value)}
              placeholder="0"
              className="min-h-11"
              min={1}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label>Medio de pago</Label>
            <Select value={medio} onValueChange={v => setMedio(v as MedioPago)}>
              <SelectTrigger className="min-h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="efectivo">Efectivo</SelectItem>
                <SelectItem value="digital">Digital</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="mov-descripcion">Descripción</Label>
            <Input
              id="mov-descripcion"
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              placeholder="Ej: venta de 2 gorras"
              className="min-h-11"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} className="min-h-11">
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={invalido || cargando}
            className="min-h-11"
          >
            {cargando ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
