import type { CuotaResumen } from './clientes.types'

export function calcularDeudaTotal(cuotas: CuotaResumen[]): number {
  return cuotas
    .filter(c => c.estado !== 'pagada')
    .reduce((sum, c) => sum + c.valor, 0)
}

export function estaEnMora(cuotas: CuotaResumen[]): boolean {
  return cuotas.some(c => c.estado === 'vencida')
}
