# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Agente activo por defecto

Al iniciar sesión en este proyecto, asumir el rol del **Orquestador**. Cargar en orden:
1. `.claude/agents/orquestador.md`
2. `.claude/context/project_status.md`
3. `.claude/context/domain.md`

---

## Comandos

```powershell
bun run dev           # servidor de desarrollo
bun run build         # tsc + vite build
bun run lint          # ESLint
bun run test:run      # vitest run (una pasada, sin watch) — usar SIEMPRE este, no "bun test --run"
bun run test          # vitest watch
bun run test:coverage # cobertura

# un solo archivo de tests
bun run test:run -- src/clientes/__tests__/clientes.service.test.ts
```

**Importante**: `bun test --run` usa el runner nativo de Bun (sin `vi`). Siempre usar `bun run test:run`.

Requiere `.env.local` con:
```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

---

## Arquitectura

**Screaming Architecture** (DEC-05): las carpetas raíz de `src/` son módulos de negocio, no capas técnicas.

```
src/
  auth/         ventas/       clientes/     cobros/
  caja/         inventario/   reportes/     negocio/
  shared/       app/
```

Cada módulo sigue esta estructura interna consistente:
```
[modulo]/
  [modulo].types.ts       ← interfaces TypeScript del módulo
  [modulo].service.ts     ← queries Supabase (solo SELECT en reportes)
  [modulo].store.ts       ← Zustand store
  [modulo].utils.ts       ← funciones puras (sin side effects)
  components/             ← componentes React del módulo
  __tests__/              ← tests Vitest
  index.ts                ← barrel export (todo lo público del módulo)
  .claude/                ← context.md y schema.md del módulo
```

**shared/** solo para código que cumple las tres condiciones simultáneas: usado por 2+ módulos, sin pertenencia conceptual a ningún módulo, sin lógica de negocio (DEC-06).

---

## Estado y backend

- **Estado global**: Zustand exclusivamente. Prohibido Context API para estado de app (DEC-01).
- **Backend**: Supabase (PostgreSQL + Auth). No hay backend propio.
- **Cliente Supabase**: `@/shared/lib/supabase` — incluye wrapper fetch con timeout de 10s para evitar requests colgados cuando el browser pausa tabs en segundo plano.
- **RLS**: habilitado en todas las tablas. Toda query asume el usuario autenticado como contexto.

---

## Convenciones de datos

- **Dinero**: valores en **pesos COP** en todo el cliente TypeScript (DEC-08). `formatearPesos(n)` recibe pesos, no centavos. Los fixtures de tests usan pesos (50000 = $50.000 COP).
- **Fechas**: strings ISO en UTC desde Supabase. Las cuotas tienen `fecha_vencimiento` como `YYYY-MM-DD`.

---

## Testing

Patrón TDD estricto: tests en rojo antes de implementar. Ningún código de producción existe sin test.

**Mock de Supabase** para tests de service/store:
```ts
import '@/test-utils/supabase.mock'
import { mockSupabase, mockQueryBuilder } from '@/test-utils/supabase.mock'
```
El mock es un query builder chainable + thenable. Configurar con `mockQueryBuilder.order.mockResolvedValue(...)`, etc. en `beforeEach`.

**Tests de componentes**: usar `vi.mocked(useStore)` para mockear stores Zustand.

---

## Reglas de oro del proyecto

1. **TDD estricto**: ningún código de producción sin test previo.
2. **Git atómico**: cada commit = estado verde (143/143 tests pasando).
3. **Registro de decisiones**: toda decisión técnica importante → `.claude/context/decisions.md`.
4. **Sesión corta = una tarea**: si no cabe en una oración, partir antes de empezar.
5. **Modo caveman**: respuestas terse, fragmentos OK, sin fluff. Código sin tocar.
