export interface CuotaResumen {
  id: string
  valor: number
  estado: 'pendiente' | 'pagada' | 'vencida'
  fecha_vencimiento: string
}

export interface Cliente {
  id: string
  user_id: string
  nombre: string
  telefono: string
  notas: string | null
  created_at: string
  updated_at: string
  cuotas: CuotaResumen[]
}

export type CrearCliente = {
  nombre: string
  telefono: string
  notas?: string | null
}

export type ActualizarCliente = Partial<CrearCliente>
