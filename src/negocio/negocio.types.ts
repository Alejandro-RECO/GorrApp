export interface Invitacion {
  id: string
  negocio_id: string
  codigo: string
  creado_por: string
  usado_por: string | null
  usado_at: string | null
  expira_at: string
  created_at: string
}

export interface Miembro {
  id: string
  user_id: string
  negocio_id: string
  email: string | null
  created_at: string
}
