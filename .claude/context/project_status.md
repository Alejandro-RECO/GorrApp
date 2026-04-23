# Estado del Proyecto — GorrApp
# Actualizar al INICIO y CIERRE de cada sesión

---

## Estado actual
- **Fase**: FASE 2 COMPLETADA — schema de base de datos en producción
- **Sprint activo**: 1 (desarrollo de módulos)
- **Rama activa**: master

---

## Hitos completados
- ✅ Sistema de agentes (6 agentes, 3 skills)
- ✅ Stack base: Vite + React 18 + TS6 + Bun + shadcn/ui + Tailwind v4
- ✅ Screaming Architecture: 7 módulos de negocio
- ✅ 6 migraciones SQL ejecutadas en Supabase (7 tablas)
- ✅ RLS habilitado en las 7 tablas (user_isolation)
- ✅ Tipos Supabase generados y tipados (supabase.types.ts real)
- ✅ schema.md actualizado por módulo
- ✅ DEC-07 registrada (schema canónico MVP)
- ✅ Build limpio — TypeScript + Vite sin errores

---

## Tablas en Supabase (cwphowtjsowyovikupqj)
| Tabla               | Módulo     | RLS |
|---------------------|------------|-----|
| clientes            | clientes   | ✅  |
| ventas              | ventas     | ✅  |
| cuotas              | cobros     | ✅  |
| abonos              | cobros     | ✅  |
| movimientos_caja    | caja       | ✅  |
| productos           | inventario | ✅  |
| compras_inventario  | inventario | ✅  |

---

## Siguiente sesión — FASE 3: Módulo auth
Tarea: implementar login/logout con Supabase Auth
1. Activar Agente Testing — escribir tests de auth.service en rojo
2. Activar Agente Backend — implementar auth.service (login, logout, getUser)
3. Activar Agente Frontend — LoginPage con form + validación
4. Test E2E básico con Playwright

HU a resolver: HU-01 — "Como operador, quiero iniciar sesión para acceder al sistema"

---

## Bloqueadores activos
*(ninguno)*

---

## Deuda técnica registrada
- [ ] Mover `src/components/ui/` a `src/shared/components/ui/` cuando un segundo módulo use los componentes (DEC-06)
- [ ] Configurar GitHub Actions (lint + test en cada PR)
- [ ] Crear seed.sql con datos de prueba para desarrollo

---

*Última actualización: 2026-04-22 — cierre HU-00 schema base*
