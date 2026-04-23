# Decisiones técnicas — GorrApp
# Agregar entrada cada vez que se tome una decisión importante

---

## Formato de entrada

```
## [DEC-nn] Título corto
- **Fecha**: YYYY-MM-DD
- **Estado**: APROBADA | PENDIENTE | REEMPLAZADA
- **Contexto**: por qué era necesario decidir esto
- **Decisión**: qué se decidió exactamente
- **Razón**: por qué esta opción y no otras
- **Consecuencias**: qué implica esta decisión hacia adelante
```

---

## [DEC-01] Zustand como gestor de estado global
- **Fecha**: 2025-01 (sesión de arquitectura inicial)
- **Estado**: APROBADA
- **Contexto**: Se necesita un gestor de estado para sincronizar datos entre
  módulos (caja, ventas, clientes) sin prop drilling.
- **Decisión**: Usar Zustand. Es prioridad sobre Context API y Redux.
- **Razón**: API mínima, sin boilerplate, compatible con TypeScript, ideal para
  un solo desarrollador con sesiones cortas.
- **Consecuencias**: Todo estado global vive en stores Zustand en
  `src/stores/`. Prohibido usar Context API para estado de aplicación.

## [DEC-02] Supabase como backend completo
- **Fecha**: 2025-01 (sesión de arquitectura inicial)
- **Estado**: APROBADA
- **Contexto**: Se necesita base de datos, autenticación y API sin mantener
  un servidor propio.
- **Decisión**: Supabase maneja auth, PostgreSQL y Edge Functions.
- **Razón**: La API auto-generada elimina la necesidad de un backend custom.
  RLS de PostgreSQL maneja seguridad por usuario. Plan gratuito suficiente
  para el MVP.
- **Consecuencias**: No hay backend propio. La lógica de negocio compleja
  vive en Edge Functions o en el cliente con validaciones Zustand.

## [DEC-03] Bun como runtime y bundler
- **Fecha**: 2025-01 (sesión de arquitectura inicial)
- **Estado**: APROBADA
- **Contexto**: Se necesita un bundler moderno, rápido y con buena experiencia
  en Windows.
- **Decisión**: Bun reemplaza Node/npm/Vite para scripts y bundling.
- **Razón**: Velocidad de instalación y ejecución. Compatible con el
  ecosistema de React y Vitest.
- **Consecuencias**: Todos los scripts usan `bun` en lugar de `npm run`.
  En Windows PowerShell: `bun install`, `bun test`, `bun run dev`.

## [DEC-04] Contexto modular por sesión corta
- **Fecha**: 2025-01 (sesión de definición de agentes)
- **Estado**: APROBADA
- **Contexto**: Las sesiones de trabajo son cortas (< 1 hora). Cargar todo
  el contexto del proyecto en cada sesión quema tokens innecesariamente.
- **Decisión**: Cada módulo tiene su propio `.claude/context.md`. El
  orquestador carga solo el contexto del módulo activo + los archivos
  Nivel 1 (project_status.md + domain.md).
- **Razón**: Maximizar el uso del contexto disponible para la tarea real,
  no para recordar el proyecto completo.
- **Consecuencias**: Disciplina estricta en mantener los archivos de contexto
  actualizados al cierre de cada sesión. Sin esto, el sistema se rompe.

## [DEC-05] Screaming Architecture como principio estructural
- **Fecha**: 2025-01 (sesión de definición de agentes)
- **Estado**: APROBADA
- **Contexto**: Se necesita una arquitectura que sea legible para el
  negocio, no para el framework. El proyecto debe comunicar qué hace
  antes de comunicar cómo está construido.
- **Decisión**: Screaming Architecture. Las carpetas raíz de `src/`
  son los módulos de negocio: `ventas/`, `cobros/`, `caja/`,
  `clientes/`, `inventario/`, `reportes/`, `auth/`. No hay carpetas
  técnicas en el primer nivel (`components/`, `hooks/`, `pages/`).
- **Razón**: Con sesiones de trabajo cortas, el desarrollador necesita
  orientarse rápido. Ver `src/ventas/` dice inmediatamente dónde está
  la lógica de ventas, sin tener que inferirlo desde carpetas técnicas.
- **Consecuencias**: Cada módulo es autónomo con su propia estructura
  interna consistente. El Agente Arquitecto es el guardián de esta
  regla y bloquea PRs que la violen.

## [DEC-06] shared/ con criterio de entrada estricto
- **Fecha**: 2025-01 (sesión de definición de agentes)
- **Estado**: APROBADA
- **Contexto**: Screaming Architecture prohíbe carpetas técnicas en
  primer nivel, pero inevitablemente hay código genuinamente compartido
  entre módulos (cliente Supabase, componentes UI base, tipos globales).
- **Decisión**: Existe `src/shared/` exclusivamente para elementos que
  cumplen las tres condiciones simultáneas: (1) usado por 2+ módulos,
  (2) sin pertenencia conceptual a ningún módulo, (3) sin lógica de
  negocio. Si hay duda, el elemento NO va a shared/.
- **Razón**: Evitar que shared/ se convierta en un vertedero de código
  que "no sabemos dónde poner". Ese es el anti-patrón más común que
  destruye la Screaming Architecture con el tiempo.
- **Consecuencias**: Un elemento empieza en el módulo que lo necesita.
  Solo se mueve a shared/ cuando un segundo módulo lo requiere. Esta
  migración la aprueba el Agente Arquitecto.

---

## [DEC-07] Schema canónico del MVP — 7 tablas
- **Fecha**: 2026-04-22
- **Estado**: APROBADA
- **Contexto**: Necesidad de definir el schema de base de datos antes de
  iniciar cualquier implementación de módulos. El schema debe reflejar
  exactamente las reglas de negocio del domain.md.
- **Decisión**: 7 tablas en PostgreSQL (Supabase): clientes, ventas,
  cuotas, abonos, movimientos_caja, productos, compras_inventario.
  Orden de migraciones: 001→006. RLS habilitado en todas las tablas.
  Todos los valores monetarios en centavos COP como INTEGER.
- **Razón**: INTEGER evita errores de punto flotante en dinero.
  RLS single-policy (FOR ALL) es suficiente para el modelo de un
  solo operador por cuenta. FK soft en movimientos_caja.referencia_id
  desacopla caja de ventas/cobros en nivel DB.
- **Consecuencias**: 
  - Toda lógica de negocio (calcular cuotas, actualizar estado de
    cuota al recibir abono, actualizar stock) vive en los services
    del cliente — no en triggers SQL.
  - `reportes/` no tiene tablas propias — solo queries de lectura.
  - El schema.md de cada módulo es la referencia para su service.

---

*Próximas decisiones pendientes:*
- [ ] Estrategia de manejo de errores en el cliente