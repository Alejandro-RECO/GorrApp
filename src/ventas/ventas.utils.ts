import type { TipoVenta, CuotaCalculada } from './ventas.types'

function agregarDias(fecha: Date, dias: number): string {
  const resultado = new Date(fecha)
  resultado.setUTCDate(resultado.getUTCDate() + dias)
  return resultado.toISOString().split('T')[0]
}

export function calcularCuotas(params: {
  total: number
  tipo: TipoVenta
  fechaVenta: Date
}): CuotaCalculada[] {
  const { total, tipo, fechaVenta } = params

  if (tipo === 'contado') return []

  if (tipo === 'fiado_una_cuota') {
    return [
      {
        numero_cuota: 1,
        valor: total,
        fecha_vencimiento: agregarDias(fechaVenta, 30),
        estado: 'pendiente',
      },
    ]
  }

  const valorCuota = Math.round(total / 2)
  return [
    {
      numero_cuota: 1,
      valor: valorCuota,
      fecha_vencimiento: agregarDias(fechaVenta, 15),
      estado: 'pendiente',
    },
    {
      numero_cuota: 2,
      valor: valorCuota,
      fecha_vencimiento: agregarDias(fechaVenta, 30),
      estado: 'pendiente',
    },
  ]
}

export function validarVenta(params: {
  clienteId: string
  total: number
  tipo: string
}): string | null {
  if (!params.clienteId) return 'El cliente es obligatorio'
  if (params.total <= 0) return 'El total debe ser mayor a 0'
  return null
}
