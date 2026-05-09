export interface ResumenGeneral {
  totalVendido: number
  totalCartera: number
  totalEfectivo: number
  totalDigital: number
  rentabilidad: number
  clientesEnMora: number
  valorInventario: number
}

export interface VentasPeriodo {
  desde: string
  hasta: string
  ventas: { id: string; total: number; created_at: string }[]
  total: number
}

export interface ItemCartera {
  id: string
  estado: 'pendiente' | 'vencida'
  valor: number
  fecha_vencimiento: string
  cliente: { id: string; nombre: string; telefono: string }
  diasVencido: number
  saldo: number
}
