# Estado del Proyecto — GorrApp
# Actualizar al INICIO y CIERRE de cada sesión

---

## Estado actual
- **Fase**: FASE 1 COMPLETADA — stack base inicializado
- **Sprint activo**: 1 (desarrollo de módulos)
- **Rama activa**: master

---

## Hitos completados
- ✅ Sistema de agentes definido (6 agentes, 3 skills)
- ✅ Stack base: Vite + React 18 + TS6 + Bun
- ✅ Tailwind CSS v4 + shadcn/ui (10 componentes base)
- ✅ Supabase JS client configurado
- ✅ Zustand instalado
- ✅ Vitest + Testing Library + Playwright configurados
- ✅ Screaming Architecture: 7 módulos de negocio
- ✅ shared/lib/supabase.ts — cliente singleton tipado
- ✅ shared/lib/utils.ts — cn + formatearPesos
- ✅ app/router.tsx — RUTAS con todas las rutas del dominio
- ✅ Contexto .claude por módulo (context.md + schema.md)
- ✅ Carpeta de migraciones con README
- ✅ Commit inicial pusheado a GitHub

---

## En progreso ahora
*(nada — fase de setup cerrada)*

---

## Siguiente sesión — FASE 2: Schema de base de datos
1. Definir schema SQL completo (tablas: clientes, ventas, cuotas, abonos, movimientos_caja, productos)
2. Crear migración inicial en src/supabase/migrations/
3. Aplicar en Supabase Dashboard
4. Regenerar tipos: npx supabase gen types typescript --project-id cwphowtjsowyovikupqj --schema public > src/shared/types/supabase.types.ts
5. Activar Agente Arquitecto para validar schema vs domain.md

---

## Bloqueadores activos
- ⚠️ Supabase CLI requiere token de acceso para `gen types`. Workaround: copiar SQL desde Dashboard y generar tipos manualmente, o hacer login con `npx supabase login` antes de la próxima sesión.

---

## Notas técnicas importantes
- shadcn coloca componentes en `src/components/ui/` (su default) — NO en `src/shared/components/ui/`. Aceptado por ahora; mover a shared/ si un segundo módulo lo requiere (DEC-06).
- TS6 no necesita `baseUrl` para path aliases — solo `paths` en tsconfig.
- `vite.config.ts` usa `defineConfig` de `vitest/config` para tipado correcto del bloque `test`.
- `supabase.types.ts` es un placeholder — regenerar cuando haya schema real.

---

## Deuda técnica registrada
- [ ] Mover `src/components/ui/` a `src/shared/components/ui/` cuando un segundo módulo use los componentes (DEC-06)
- [ ] Regenerar tipos de Supabase tras primera migración
- [ ] Configurar GitHub Actions (lint + test en cada PR)

---

*Última actualización: 2026-04-22 — cierre de sesión FASE 1*
