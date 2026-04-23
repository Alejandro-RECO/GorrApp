import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useClientesStore } from '@/clientes'
import { calcularCuotas } from '@/ventas'
import { ResumenCuotas } from './ResumenCuotas'
import type { CrearVenta, TipoVenta, MedioPago } from '@/ventas'

interface Props {
  onVentaRegistrada?: (datos: CrearVenta) => void | Promise<void>
}

type TipoBase = 'contado' | 'fiado'

export function FormVenta({ onVentaRegistrada }: Props) {
  const { clientes } = useClientesStore()

  const [clienteId, setClienteId] = useState('')
  const [totalPesos, setTotalPesos] = useState('')
  const [tipoBase, setTipoBase] = useState<TipoBase>('contado')
  const [numeroCuotas, setNumeroCuotas] = useState<'1' | '2'>('1')
  const [medioPago, setMedioPago] = useState<MedioPago>('efectivo')
  const [notas, setNotas] = useState('')
  const [enviando, setEnviando] = useState(false)

  const totalCentavos = Math.round(parseFloat(totalPesos || '0') * 100)

  const tipoVenta: TipoVenta =
    tipoBase === 'contado'
      ? 'contado'
      : numeroCuotas === '1'
        ? 'fiado_una_cuota'
        : 'fiado_dos_cuotas'

  const cuotasPreview =
    tipoBase === 'fiado' && totalCentavos > 0
      ? calcularCuotas({ total: totalCentavos, tipo: tipoVenta, fechaVenta: new Date() })
      : []

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clienteId || totalCentavos <= 0) return

    const datos: CrearVenta = {
      cliente_id: clienteId,
      total: totalCentavos,
      tipo: tipoVenta,
      medio_pago: medioPago,
      notas: notas.trim() || null,
    }

    setEnviando(true)
    try {
      await onVentaRegistrada?.(datos)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="cliente">Cliente</Label>
        <select
          id="cliente"
          value={clienteId}
          onChange={e => setClienteId(e.target.value)}
          className="min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Selecciona un cliente</option>
          {clientes.map(c => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="total">Total ($)</Label>
        <Input
          id="total"
          type="number"
          min="0"
          step="1"
          value={totalPesos}
          onChange={e => setTotalPesos(e.target.value)}
          placeholder="0"
          className="min-h-11"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="tipo-venta">Tipo de venta</Label>
        <select
          id="tipo-venta"
          value={tipoBase}
          onChange={e => setTipoBase(e.target.value as TipoBase)}
          className="min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="contado">Contado</option>
          <option value="fiado">Fiado</option>
        </select>
      </div>

      {tipoBase === 'fiado' && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="cuotas">Cuotas</Label>
          <select
            id="cuotas"
            value={numeroCuotas}
            onChange={e => setNumeroCuotas(e.target.value as '1' | '2')}
            className="min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="1">1 cuota (vence a 30 días)</option>
            <option value="2">2 cuotas (15 y 30 días)</option>
          </select>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="medio-pago">Medio de pago</Label>
        <select
          id="medio-pago"
          value={medioPago}
          onChange={e => setMedioPago(e.target.value as MedioPago)}
          className="min-h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="efectivo">Efectivo</option>
          <option value="digital">Digital (Nequi / Bancolombia)</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="notas">Notas (opcional)</Label>
        <Input
          id="notas"
          value={notas}
          onChange={e => setNotas(e.target.value)}
          placeholder="Observaciones..."
          className="min-h-11"
        />
      </div>

      {cuotasPreview.length > 0 && (
        <ResumenCuotas cuotas={cuotasPreview} />
      )}

      <Button type="submit" disabled={enviando || !clienteId || totalCentavos <= 0} className="min-h-11 w-full">
        Registrar venta
      </Button>
    </form>
  )
}
