# Estado del Proyecto — GorrApp
# Actualizar al INICIO y CIERRE de cada sesión

---

## Estado actual
- **Fase**: ✅ MVP COMPLETO — todos los módulos implementados y mergeados a master
- **Sprint activo**: Sprint 2 (polish, bugs, producción)
- **Rama activa**: master

---

## MVP — Módulos implementados (7/7)

| Módulo      | HU   | Tests  | Estado |
|-------------|------|--------|--------|
| Auth        | HU-01 | 13    | ✅ |
| Clientes    | HU-02 | 43    | ✅ |
| Ventas      | HU-03 | 56    | ✅ |
| Cobros      | HU-04 | 89    | ✅ |
| Caja        | HU-05 | —     | ✅ |
| Inventario  | HU-06 | 12    | ✅ |
| Reportes    | HU-07 | 17    | ✅ |

**Total tests en suite**: 134 (132 passing, 2 pre-existing failures — ver deuda técnica)

---

## Hitos completados

- ✅ HU-07: módulo reportes completo (17 tests, TDD RED→GREEN)
  - reportes.types: ResumenGeneral, VentasPeriodo, ItemCartera
  - reportes.utils: calcularTotalVendido, calcularTotalCartera, calcularRentabilidad, agruparVentasPorDia, clientesEnMora
  - reportes.service: solo SELECT — obtenerResumenGeneral, obtenerVentasPeriodo, obtenerCarteraPendiente
  - reportes.store: Zustand — cargarResumen, cargarVentasPeriodo, cargarCarteraPendiente
  - ReportesPage: Tabs (Resumen / Ventas / Cartera)
  - ResumenGeneral: 4 cards + card rentabilidad con Progress bar
  - GraficoVentas: BarChart recharts responsive + SelectorPeriodo (semana/mes/personalizado)
  - TablaCartera: cuotas ordenadas por días vencido ↓ + Badge + copiar mensaje WhatsApp
  - IndexPage: card Reportes muestra totalVendido acumulado
  - recharts instalado, progress shadcn agregado
  - APROBADO CON OBSERVACIONES (0 BLOCKERs, 4 SUGGESTIONs → deuda técnica)
- ✅ HU-06: módulo inventario completo (12 tests)
  - BLOCKER resuelto: rollback manual en registrarCompra
- ✅ HU-05: módulo caja (merge 2026-05-03)
- ✅ HU-04: módulo cobros (89 tests, 80.88% cobertura components)
- ✅ HU-03: módulo ventas — TDD completo (56 tests)
- ✅ HU-02: módulo clientes CRUD (43 tests, 85.45% cobertura)
- ✅ HU-01: auth completo (13 tests, 94% cobertura)
- ✅ HU-00: stack base + 7 tablas Supabase + RLS + Screaming Architecture
- ✅ Sistema de agentes: 6 agentes, 3 skills, protocolo TDD RED→GREEN→REFACTOR

---

## Arquitectura final MVP

```
src/
  auth/           ← LoginPage, auth.service, auth.store
  clientes/       ← ListaClientes, DetalleCliente, CRUD completo
  ventas/         ← FormVenta (3 pasos), ListaVentas, cuotas
  cobros/         ← ListaCobros, FormAbono, MensajeCobro WhatsApp
  caja/           ← CajaPage, movimientos, resumen por medio
  inventario/     ← ListaProductos, FormProducto, FormCompra
  reportes/       ← ReportesPage (Tabs), gráficos, cartera
  shared/         ← Navbar, utils (formatearPesos, cn)
  app/            ← Router, IndexPage (dashboard), routes
  components/ui/  ← shadcn/ui components
  test-utils/     ← supabase.mock (chainable + thenable)
```

---

## Configuración pendiente — REQUIERE ACCIÓN MANUAL

⚠️ **Supabase OAuth con Google no está configurado todavía.**
1. Supabase Dashboard → Authentication → Providers → Google → Enable
2. Google Cloud Console → OAuth 2.0 Client ID
3. Authorized redirect URI: `https://cwphowtjsowyovikupqj.supabase.co/auth/v1/callback`
4. Pegar Client ID + Secret en Supabase

⚠️ **Variables de entorno para producción** — verificar `.env.production` antes de deploy.

---

## Siguiente iteración — Sprint 2 (post-MVP)

Prioridades sugeridas:
1. **Fix crítico**: centavos vs pesos (bloquea datos correctos en prod)
2. **Fix crítico**: cobros.utils.test.ts + ListaClientes.test.tsx (2 tests rojos)
3. **Feature**: cron job para marcar cuotas vencidas (Edge Function Supabase)
4. **Feature**: notificaciones WhatsApp automáticas desde cobros
5. **Feature**: rentabilidad real (ventas - compras_inventario)
6. **Infraestructura**: GitHub Actions (lint + test en cada PR)
7. **Deploy**: Vercel + Supabase producción

---

## Deuda técnica registrada

### Crítica (bloquea producción)
- [ ] **Fix**: centavos vs pesos — inconsistencia sistémica. Toda la codebase usa pesos directamente pero docs dicen centavos. Síntomas: cobros.utils.test.ts:130 + ListaClientes.test.tsx:153 (2 tests rojos). Corregir unificando convención antes de deploy.

### Alta (afecta datos)
- [ ] **Fix**: `ResumenGeneral.rentabilidad` = `totalVendido` (no resta compras). Implementar query a `compras_inventario`.
- [ ] **Fix**: `clientesEnMora: 0` hardcoded en obtenerResumenGeneral.
- [ ] **Fix**: `obtenerCarteraPendiente` omite cuotas con `estado === 'vencida'`. Necesita `.in('estado', ['pendiente','vencida'])`.
- [ ] **Fix**: VentasService.crear() sin compensating delete si falla insert cuotas.

### Media (calidad de código)
- [ ] **Test**: crearProducto() en inventario.service sin cobertura
- [ ] **Test**: ventas.store.ts sin tests
- [ ] **Test**: DetalleCliente sin tests propios
- [ ] **Test**: cobros.service branch coverage 55%
- [ ] **Refactor**: inventario.service escribe en movimientos_caja directamente (cross-module write).
- [ ] **Fix**: router.tsx re-exporta RUTAS (ESLint fast-refresh warning)

### Baja (infraestructura)
- [ ] **DEC-06**: Mover `src/components/ui/` a `src/shared/components/ui/`
- [ ] **Fix**: timezone edge case en agregarDias para ventas > 19:00 Colombia
- [ ] **Infra**: Configurar GitHub Actions (lint + test en cada PR)
- [ ] **Infra**: Configurar Google OAuth en Supabase Dashboard
- [ ] **Test**: auth callbacks onAuthStateChange, obtenerSesionActiva error branch

---

*Última actualización: 2026-05-05 — merge HU-07 a master. MVP COMPLETO.*
