import type { Cuota, Abono } from './cobros.types'
import { formatearPesos } from '@/shared/lib/utils'

export function calcularSaldoPendiente(cuota: { valor: number }, abonos: Abono[]): number {
  const sumaAbonos = abonos.reduce((sum, a) => sum + a.valor, 0)
  return cuota.valor - sumaAbonos
}

export function cuotaEstaPagada(cuota: { valor: number }, abonos: Abono[]): boolean {
  return calcularSaldoPendiente(cuota, abonos) <= 0
}

export function cuotaEstaVencida(cuota: Cuota): boolean {
  if (cuota.estado !== 'pendiente') return false
  const hoy = new Date().toISOString().split('T')[0]
  return cuota.fecha_vencimiento < hoy
}

export function generarMensajeCobro(
  cliente: { nombre: string; telefono: string },
  cuotas: Cuota[]
): string {
  const total = cuotas.reduce((sum, c) => sum + c.valor, 0)
  return `Hola ${cliente.nombre}, tienes ${cuotas.length} cuota(s) pendiente(s) por un total de ${formatearPesos(total)}.`
}