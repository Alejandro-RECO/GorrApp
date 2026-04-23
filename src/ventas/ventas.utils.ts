import type { TipoVenta, CuotaCalculada } from './ventas.types'

const TIPOS_VALIDOS: TipoVenta[] = ['contado', 'fiado_una_cuota', 'fiado_dos_cuotas']

function agregarDias(fecha: Date, dias: number): string {
  const resultado = new Date(fecha)
  resultado.setDate(resultado.getDate() + dias)
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

  const valorCuota1 = Math.round(total / 2)
  return [
    {
      numero_cuota: 1,
      valor: valorCuota1,
      fecha_vencimiento: agregarDias(fechaVenta, 15),
      estado: 'pendiente',
    },
    {
      numero_cuota: 2,
      valor: total - valorCuota1,
      fecha_vencimiento: agregarDias(fechaVenta, 30),
      estado: 'pendiente',
    },
  ]
}

export function calcularTotalVenta(items: { precio: number; cantidad: number }[]): number {
  return items.reduce((sum, item) => sum + item.precio * item.cantidad, 0)
}

export function validarVenta(datos: {
  clienteId: string
  total: number
  tipo: string
}): string | null {
  if (!datos.clienteId) return 'El cliente es obligatorio'
  if (datos.total <= 0) return 'El total debe ser mayor a 0'
  if (!TIPOS_VALIDOS.includes(datos.tipo as TipoVenta)) return 'El tipo de venta no es válido'
  return null
}
