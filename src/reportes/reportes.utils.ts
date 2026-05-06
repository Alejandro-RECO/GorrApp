type ConTotal = { total: number }
type ConValorEstado = { valor: number; estado: string }
type ConFecha = { total: number; created_at: string }
type ConId = { id: string }
type CuotaConClienteBase = {
  estado: string
  ventas: { clientes: { id: string } }
}

export function calcularTotalVendido(ventas: ConTotal[]): number {
  return ventas.reduce((sum, v) => sum + v.total, 0)
}

export function calcularTotalCartera(cuotas: ConValorEstado[]): number {
  return cuotas
    .filter(c => c.estado !== 'pagada')
    .reduce((sum, c) => sum + c.valor, 0)
}

export function calcularRentabilidad(
  ventas: ConTotal[],
  compras: ConTotal[]
): number {
  return calcularTotalVendido(ventas) - calcularTotalVendido(compras)
}

export function agruparVentasPorDia(ventas: ConFecha[]): Record<string, number> {
  return ventas.reduce((acc, v) => {
    const fecha = v.created_at.split('T')[0]
    acc[fecha] = (acc[fecha] ?? 0) + v.total
    return acc
  }, {} as Record<string, number>)
}

export function clientesEnMora<T extends ConId>(
  clientes: T[],
  cuotas: CuotaConClienteBase[]
): T[] {
  const morososIds = new Set(
    cuotas
      .filter(c => c.estado === 'vencida')
      .map(c => c.ventas.clientes.id)
  )
  return clientes.filter(c => morososIds.has(c.id))
}
