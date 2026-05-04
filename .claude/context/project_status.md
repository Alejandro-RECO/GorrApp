# Estado del Proyecto — GorrApp
# Actualizar al INICIO y CIERRE de cada sesión

---

## Estado actual
- **Fase**: HU-04 MERGEADO a master — listo para HU-05 módulo caja
- **Sprint activo**: 1 (desarrollo de módulos)
- **Rama activa**: master

---

## Hitos completados
- ✅ HU-04: módulo cobros (89 tests, 80.88% cobertura components)
  - cobros.utils: calcularSaldoPendiente, cuotaEstaVencida, generarMensajeCobro (COP fmt)
  - cobros.service: obtenerCuotasPendientes, registrarAbono (auto-marca pagada)
  - cobros.store: Zustand — cargarCuotasPendientes, registrarAbono, cargarAbonos
  - ListaCobros: sort vencidas primero + Badge estado + botones Abonar/WhatsApp
  - FormAbono: Dialog con saldo pendiente + validación + medio de pago
  - MensajeCobro: Dialog con enlace wa.me + copia portapapeles
- ✅ Sistema de agentes (6 agentes, 3 skills)
- ✅ Stack base: Vite + React 18 + TS + Bun + shadcn/ui + Tailwind v4
- ✅ Screaming Architecture: 7 módulos de negocio
- ✅ 7 tablas en Supabase con RLS (HU-00)
- ✅ Tipos Supabase generados (supabase.types.ts)
- ✅ HU-01: auth.service + auth.store + LoginPage (13 tests, 94% cobertura)
- ✅ HU-02: módulo clientes CRUD completo (43 tests, 85.45% cobertura)
- ✅ HU-03: refactor ventas — TDD RED→GREEN completo (56 tests)
  - ventas.utils: calcularCuotas (15/30 días UTC-safe), validarVenta
  - ventas.service: crear() ventas+cuotas, obtenerTodos() con join
  - ventas.store: Zustand pattern estándar
  - FormVenta: 3 pasos (cliente → monto/tipo/pago → resumen+cuotas preview)
  - ListaVentas: Table shadcn + Badge verde/amarillo + Skeleton
  - Navbar: Sheet móvil, links activos, Avatar+DropdownMenu logout
  - IndexPage: grid 6 módulos, CTA venta rápida
  - Router: rutas completas + placeholders (caja/cobros/inventario/reportes)
  - Fix: RUTAS extraído a routes.ts (eliminar dependencia circular)
- ✅ supabase.mock extendido con mockQueryBuilder (chainable + thenable)
- ✅ shadcn/ui: sheet, dropdown-menu, avatar, navigation-menu, tabs, sonner

---

## Estructura módulo ventas (HU-03 final)
```
src/ventas/
  ventas.types.ts         ← Venta, CrearVenta, VentaConCliente, CuotaCalculada
  ventas.utils.ts         ← calcularCuotas, validarVenta, agregarDias (UTC)
  ventas.service.ts       ← crear() ventas+cuotas secuencial, obtenerTodos()
  ventas.store.ts         ← Zustand: ventas[], cargarVentas, agregarVenta
  index.ts                ← barrel: types + store + utils + components
  components/
    FormVenta.tsx          ← 3 pasos con preview cuotas
    ListaVentas.tsx        ← Table + Badge + Skeleton, acepta clienteId?
  __tests__/
    ventas.utils.test.ts  ← 8 tests, 100% cobertura
    ventas.service.test.ts ← 4 tests, 100% cobertura
src/app/
  routes.ts               ← RUTAS const (extraído para evitar circular dep)
  router.tsx              ← AppRoutes + re-export RUTAS
  pages/IndexPage.tsx     ← Dashboard grid 6 módulos
  App.tsx                 ← Navbar + main + AppRoutes
src/shared/components/layout/
  Navbar.tsx              ← top bar, Sheet móvil, avatar+dropdown
```

---

## Decisión arquitectural HU-03
- `RUTAS` vive en `src/app/routes.ts` independiente (sin imports)
- `router.tsx` re-exporta `RUTAS` por compatibilidad
- Consumidores importan directamente desde `@/app/routes`
- `Navbar.tsx` en `src/shared/components/layout/` (componente de app, no de módulo)
- `IndexPage.tsx` en `src/app/pages/` (page-level, no módulo de negocio)

---

## Configuración pendiente — REQUIERE ACCIÓN MANUAL
⚠️ **Supabase OAuth con Google no está configurado todavía.**
1. Supabase Dashboard → Authentication → Providers → Google → Enable
2. Google Cloud Console → OAuth 2.0 Client ID
3. Authorized redirect URI: `https://cwphowtjsowyovikupqj.supabase.co/auth/v1/callback`
4. Pegar Client ID + Secret en Supabase

---

## Siguiente sesión — HU-05: módulo caja
- HU-05: Caja — movimientos_caja, saldo efectivo vs digital

---

## Deuda técnica registrada
- [ ] Test: `obtenerSesionActiva()` lanza error si getSession falla (auth.service línea 20)
- [ ] Test: callback `onAuthStateChange` en auth.store (línea 34)
- [ ] DEC-06: Mover `src/components/ui/` a `src/shared/components/ui/` (ejecutar en HU-05)
- [ ] Test: DetalleCliente sin tests propios
- [ ] Test: ListaClientes.tsx onGuardar closures (líneas 48-61)
- [ ] Test: ventas.store.ts sin tests
- [ ] Fix: VentasService.crear() sin compensating delete si falla insert cuotas
- [ ] Fix: router.tsx re-exporta RUTAS (ESLint fast-refresh warning)
- [ ] Fix: timezone edge case en agregarDias para ventas > 19:00 Colombia
- [ ] Test: cobros.service branch coverage 55% — faltan ramas de error (líneas 13-14, 29-60)
- [ ] Test: cobros Dialog callbacks (handleOpenChange) — functions coverage 72%
- [ ] Configurar GitHub Actions (lint + test en cada PR)
- [ ] Configurar Google OAuth en Supabase Dashboard

---

*Última actualización: 2026-05-03 — merge HU-04 a master (fix BLOCKER-01: error handling en registrarAbono update)*
