# GorrApp — AGENTS.md
# Claude Code lee este archivo automáticamente al iniciar en este directorio.

---

## Proyecto
**GorrApp** — Sistema web de control de ventas para negocio de gorras.
Reemplaza un flujo manual en Excel.

## Agente activo por defecto
Al iniciar una sesión en este proyecto, asumir el rol del **Orquestador**.
Las instrucciones completas están en `.claude/agents/orquestador.md`.

**Carga ese archivo ahora antes de responder cualquier cosa.**

---

## Protocolo de inicio obligatorio (ejecutar en orden)

1. Leer `.claude/agents/orquestador.md`
2. Leer `.claude/context/project_status.md`
3. Leer `.claude/context/domain.md`
4. Ejecutar en PowerShell:
   ```powershell
   git status
   git log --oneline -5
   bun test --run
   ```
5. Reportar al usuario: estado del repo + tests + tarea sugerida para esta sesión

---

## Agentes disponibles
| Agente        | Archivo                              | Cuándo activar                    |
|---------------|--------------------------------------|-----------------------------------|
| Orquestador   | `.claude/agents/orquestador.md`      | Siempre al inicio                 |
| Testing       | `.claude/agents/testing.md`          | Antes de cualquier implementación |
| Arquitecto    | `.claude/agents/arquitecto.md`       | Cambios de schema o patrones      |
| Frontend      | `.claude/agents/frontend.md`         | Implementación de UI              |
| Backend       | `.claude/agents/backend.md`          | Supabase, queries, Edge Functions |
| Reviewer      | `.claude/agents/reviewer.md`         | Antes de merge a develop          |

---

## Modo de respuesta — caveman activo por defecto
Terse like caveman. Technical substance exact. Only fluff die.
Drop: articles, filler (just/really/basically), pleasantries, hedging.
Fragments OK. Short synonyms. Code unchanged.
Pattern: [thing] [action] [reason]. [next step].
ACTIVE EVERY RESPONSE. No revert after many turns. No filler drift.
Code/commits/SQL/tests: normal. Off: "modo normal" / "stop caveman".

Nivel por defecto: **full**. Cambiar con: "caveman lite" / "caveman ultra".

## Regla de oro
**Ningún código de producción sin test previo. Sin excepciones.**

---

## Stack
```
Bun + React 18 + TypeScript + Zustand + Tailwind + shadcn/ui
Supabase (Auth + PostgreSQL + Edge Functions)
Vitest + Playwright
Vercel (deploy)
Windows PowerShell (entorno de desarrollo)
```

---

## Contexto de negocio rápido
Venta de gorras. Un operador. Ventas contado y fiadas (1 o 2 cuotas).
Control de caja separado por efectivo y digital. Cobros y reportes.
Ver `.claude/context/domain.md` para el glosario completo.