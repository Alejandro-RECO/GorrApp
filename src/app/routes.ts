export const RUTAS = {
  inicio: "/",
  ventas: {
    lista: "/ventas",
    nueva: "/ventas/nueva",
    detalle: (id: string) => `/ventas/${id}`,
  },
  clientes: {
    lista: "/clientes",
    nuevo: "/clientes/nuevo",
    detalle: (id: string) => `/clientes/${id}`,
  },
  cobros: {
    lista: "/cobros",
    detalle: (id: string) => `/cobros/${id}`,
  },
  caja: {
    resumen: "/caja",
    movimientos: "/caja/movimientos",
  },
  inventario: {
    lista: "/inventario",
    nuevo: "/inventario/nuevo",
  },
  reportes: {
    inicio: "/reportes",
  },
  auth: {
    login: "/login",
  },
} as const
