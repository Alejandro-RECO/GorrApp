# Estado del Proyecto — GorrApp
# Actualizar al INICIO y CIERRE de cada sesión

---

## Estado actual
- **Fase**: Setup inicial — sistema de agentes COMPLETADO
- **Sprint activo**: 0 (pre-desarrollo)
- **Rama activa**: main (aún sin código de aplicación)

---

## Hitos completados
- ✅ Estructura de carpetas `.claude/` creada en el proyecto
- ✅ 6 agentes definidos: orquestador, testing, arquitecto, frontend, backend, reviewer
- ✅ 3 skills definidas: tdd, git, patterns
- ✅ 3 archivos de contexto base: project_status, domain, decisions
- ✅ Screaming Architecture definida y registrada (DEC-05)
- ✅ Estrategia Supabase definida: SQL versionado + tipos generados (sin MCP)
- ✅ Schema canónico del dominio documentado en backend.md
- ✅ Skills globales integradas: frontend-design, typescript-lsp

---

## En progreso ahora
*(nada — fase de agentes cerrada)*

---

## Siguiente sesión — FASE 1: Inicialización del proyecto
Tareas en orden:
1. Crear repositorio en GitHub
2. Inicializar proyecto: `bun create vite gorrapp --template react-ts`
3. Instalar dependencias (Zustand, shadcn, Supabase client, Vitest, Playwright)
4. Crear estructura de módulos vacíos siguiendo Screaming Architecture
5. Configurar variables de entorno y cliente Supabase
6. Primer commit: `chore: inicializar proyecto con estructura base`

---

## Bloqueadores activos
*(ninguno)*

---

## Decisiones pendientes de confirmación
- [ ] Nombre del repositorio en GitHub
- [ ] ID del proyecto en Supabase (necesario para generar tipos)

---

## Deuda técnica registrada
*(ninguna aún)*

---

*Última actualización: cierre de fase de definición de agentes*