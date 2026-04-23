# Skill: Patterns
# Versión: 1.0.0
# Aplica a: Frontend y Backend cuando implementan código del proyecto
# Cuándo cargar: antes de crear un componente, store o service nuevo

---

## PATRÓN DE STORE ZUSTAND

Cada módulo de negocio tiene exactamente un store.
El store sigue esta estructura sin variaciones:

```typescript
// src/[modulo]/[modulo].store.ts
import { create } from 'zustand'
import { [Modulo]Service } from './[modulo].service'
import type { [Entidad] } from './[modulo].types'

interface [Modulo]State {
  // Datos
  [entidades]: [Entidad][]

  // Estado de UI
  cargando: boolean
  error: string | null

  // Acciones — verbos de negocio, no técnicos
  cargar[Entidades]: () => Promise<void>
  agregar[Entidad]: (datos: Omit<[Entidad], 'id' | 'createdAt'>) => Promise<void>
  actualizar[Entidad]: (id: string, datos: Partial<[Entidad]>) => Promise<void>
}

export const use[Modulo]Store = create<[Modulo]State>((set, get) => ({
  [entidades]: [],
  cargando: false,
  error: null,

  cargar[Entidades]: async () => {
    set({ cargando: true, error: null })
    try {
      const datos = await [Modulo]Service.obtenerTodos()
      set({ [entidades]: datos, cargando: false })
    } catch (e) {
      set({ error: 'No se pudieron cargar los datos', cargando: false })
    }
  },

  agregar[Entidad]: async (datos) => {
    set({ cargando: true, error: null })
    try {
      const nuevo = await [Modulo]Service.crear(datos)
      set(state => ({
        [entidades]: [...state.[entidades], nuevo],
        cargando: false
      }))
    } catch (e) {
      set({ error: 'No se pudo guardar', cargando: false })
    }
  }
}))
```

Reglas del store:
- Los nombres de acciones son verbos de negocio en español
- Siempre manejar `cargando` y `error` en cada acción async
- El store no sabe nada de React — no importa hooks ni componentes
- El store llama al service, nunca a Supabase directamente

---

## PATRÓN DE SERVICE (CAPA SUPABASE)

```typescript
// src/[modulo]/[modulo].service.ts
import { supabase } from '@/shared/lib/supabase'
import type { [Entidad], Crear[Entidad] } from './[modulo].types'

export const [Modulo]Service = {
  async obtenerTodos(): Promise<[Entidad][]> {
    const { data, error } = await supabase
      .from('[tabla]')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data
  },

  async crear(datos: Crear[Entidad]): Promise<[Entidad]> {
    const { data, error } = await supabase
      .from('[tabla]')
      .insert(datos)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  },

  async actualizar(id: string, datos: Partial<[Entidad]>): Promise<[Entidad]> {
    const { data, error } = await supabase
      .from('[tabla]')
      .update(datos)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }
}
```

Reglas del service:
- Solo hace operaciones de datos — sin lógica de negocio
- Siempre lanza Error si Supabase retorna error (el store lo captura)
- Nunca retorna `null` — retorna el dato o lanza error
- El nombre del objeto es `[Modulo]Service` (PascalCase + Service)

---

## PATRÓN DE TIPOS DEL DOMINIO

```typescript
// src/[modulo]/[modulo].types.ts

// Tipo base — refleja la tabla de Supabase
export interface [Entidad] {
  id: string
  // ... campos de la tabla
  created_at: string
}

// Tipo para crear — sin campos auto-generados
export type Crear[Entidad] = Omit<[Entidad], 'id' | 'created_at'>

// Tipo para actualizar — todos los campos opcionales salvo id
export type Actualizar[Entidad] = Partial<Crear[Entidad]>

// Enums del dominio — usar string literals, no enum de TypeScript
export type TipoVenta = 'contado' | 'fiado_una_cuota' | 'fiado_dos_cuotas'
export type MedioPago = 'efectivo' | 'digital'
export type EstadoCuota = 'pendiente' | 'pagada' | 'vencida'
export type TipoMovimiento =
  | 'ingreso_venta'
  | 'ingreso_abono'
  | 'gasto_operativo'
  | 'gasto_inversion'
  | 'compra_mercancia'
```

Reglas de tipos:
- Preferir `type` sobre `interface` para uniones y tipos derivados
- Usar `interface` para objetos con forma fija (entidades del dominio)
- Nunca usar `enum` de TypeScript — usar string literal unions
- Los nombres siguen el glosario de domain.md exactamente

---

## PATRÓN DE BARREL (index.ts)

```typescript
// src/[modulo]/index.ts
// Exportaciones públicas del módulo — lo único visible desde afuera

// Tipos
export type { [Entidad], Crear[Entidad], TipoVenta } from './[modulo].types'

// Store
export { use[Modulo]Store } from './[modulo].store'

// Utils (solo las funciones que otros módulos pueden necesitar)
export { calcular[Algo] } from './[modulo].utils'

// NO exportar: service, implementaciones internas, helpers privados
```

---

## PATRÓN DE UTILIDADES DE NEGOCIO

```typescript
// src/[modulo]/[modulo].utils.ts
// Lógica de negocio pura — sin efectos, sin Supabase, sin React

import type { TipoVenta } from './[modulo].types'

// Siempre recibe datos como parámetro, nunca lee del store
// Siempre retorna un valor, nunca muta el input
// Siempre es testeable sin mocks

export function calcularCuotas(params: {
  total: number
  tipo: TipoVenta
  fechaVenta: Date
}): Cuota[] {
  const { total, tipo, fechaVenta } = params

  if (tipo === 'contado') return []

  if (tipo === 'fiado_una_cuota') {
    return [{
      valor: total,
      fechaVencimiento: agregarDias(fechaVenta, 30),
      estado: 'pendiente'
    }]
  }

  if (tipo === 'fiado_dos_cuotas') {
    const valorCuota = Math.round(total / 2)
    return [
      { valor: valorCuota, fechaVencimiento: agregarDias(fechaVenta, 15), estado: 'pendiente' },
      { valor: valorCuota, fechaVencimiento: agregarDias(fechaVenta, 30), estado: 'pendiente' }
    ]
  }
}

function agregarDias(fecha: Date, dias: number): Date {
  const resultado = new Date(fecha)
  resultado.setDate(resultado.getDate() + dias)
  return resultado
}
```

---

## PATRÓN DE RUTAS

```typescript
// src/app/router.tsx
// Rutas organizadas por módulo de negocio

export const RUTAS = {
  dashboard:     '/',
  ventas:        '/ventas',
  ventaNueva:    '/ventas/nueva',
  clientes:      '/clientes',
  clienteDetalle: (id: string) => `/clientes/${id}`,
  cobros:        '/cobros',
  caja:          '/caja',
  inventario:    '/inventario',
  reportes:      '/reportes',
  login:         '/login',
} as const
```

---

## CONVENCIONES DE NOMENCLATURA EN CÓDIGO

```
Componentes React:    PascalCase        → RegistrarVenta, ListaCobros
Funciones/hooks:      camelCase         → calcularCuotas, useVentaForm
Stores Zustand:       useXxxStore       → useVentasStore, useCajaStore
Services:             XxxService        → VentasService, CobrosService
Tipos entidad:        PascalCase        → Venta, Cliente, Cuota
Tipos utilitarios:    PascalCase        → CrearVenta, ActualizarCliente
Archivos componente:  PascalCase.tsx    → RegistrarVenta.tsx
Archivos lógica:      kebab.case.ts     → ventas.utils.ts, ventas.store.ts
Constantes:           UPPER_SNAKE_CASE  → RUTAS, LIMITES
```

---

## ANTIPATRONES PROHIBIDOS

```typescript
// PROHIBIDO: any
const datos: any = await fetch(...)

// PROHIBIDO: non-null assertion sin razón
const cliente = clientes.find(c => c.id === id)!

// PROHIBIDO: lógica de negocio en componente
function RegistrarVenta() {
  const cuotas = total / 2  // ← esto va en ventas.utils.ts
}

// PROHIBIDO: llamada directa a Supabase desde componente
function RegistrarVenta() {
  const { data } = await supabase.from('ventas').insert(...)  // ← va en service
}

// PROHIBIDO: múltiples responsabilidades en un componente
function PaginaVentas() {
  // fetch + transformación + render + manejo de error + modal = partir en piezas
}
```

---

*Patterns v1.0.0 — actualizar cuando se establezca un nuevo patrón recurrente en el proyecto*