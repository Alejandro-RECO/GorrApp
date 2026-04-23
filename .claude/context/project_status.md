# Estado del Proyecto — GorrApp
# Actualizar al INICIO y CIERRE de cada sesión

---

## Estado actual
- **Fase**: HU-03 COMPLETADA — módulo ventas con contado y fiado
- **Sprint activo**: 1 (desarrollo de módulos)
- **Rama activa**: master

---

## Hitos completados
- ✅ Sistema de agentes (6 agentes, 3 skills)
- ✅ Stack base: Vite + React 18 + TS6 + Bun + shadcn/ui + Tailwind v4
- ✅ Screaming Architecture: 7 módulos de negocio
- ✅ 7 tablas en Supabase con RLS (HU-00)
- ✅ Tipos Supabase generados (supabase.types.ts)
- ✅ HU-01: auth.service + auth.store + LoginPage (13 tests, 94% cobertura)
- ✅ HU-02: módulo clientes CRUD completo (43 tests, 85.45% cobertura)
- ✅ HU-03: módulo ventas contado y fiado (80 tests, 90.32% cobertura ventas)
- ✅ Routing con react-router-dom v7: /clientes, /ventas, /ventas/nueva
- ✅ DetalleCliente con historial de compras real (via ListaVentas)
- ✅ supabase.mock extendido con mockQueryBuilder (chainable + thenable)

---

## Estructura del módulo ventas (HU-03)
```
src/ventas/
  ventas.types.ts         ← Venta, CrearVenta, TipoVenta, MedioPago, CuotaCalculada
  ventas.utils.ts         ← calcularCuotas (15/30 días), calcularTotalVenta, validarVenta
  ventas.service.ts       ← crear() transacción atómica + compensating delete,
                            obtenerTodos(), obtenerPorCliente()
  ventas.store.ts         ← Zustand: ventas, cargarVentas, agregarVenta, cargarVentasPorCliente
  index.ts                ← barrel público
  components/
    FormVenta.tsx          ← form nativo con preview cuotas fiadas
    ListaVentas.tsx        ← lista con badge Contado/Fiado, acepta clienteId prop
    ResumenCuotas.tsx      ← preview cuotas calculadas con fechas
    __tests__/
      FormVenta.test.tsx
      ListaVentas.test.tsx
  __tests__/
    ventas.utils.test.ts
    ventas.service.test.ts
    ventas.store.test.ts
```

---

## Decisión arquitectural aplicada (HU-03)
- `DetalleCliente` NO importa de `@/ventas` (Regla 3 Screaming Architecture)
- Composición en `app/router.tsx` via `ClienteConHistorial` wrapper component
- `ListaVentas` acepta `clienteId?: string` prop para filtrar por cliente

---

## Configuración pendiente — REQUIERE ACCIÓN MANUAL
⚠️ **Supabase OAuth con Google no está configurado todavía.**
1. Supabase Dashboard → Authentication → Providers → Google → Enable
2. Google Cloud Console → OAuth 2.0 Client ID
3. Authorized redirect URI: `https://cwphowtjsowyovikupqj.supabase.co/auth/v1/callback`
4. Pegar Client ID + Secret en Supabase

---

## Siguiente sesión — HU-04: módulo cobros
Tarea: Gestionar cuotas pendientes y registrar abonos.
Entidades: Cuota (leer), Abono (crear)
Secuencia TDD:
1. Testing → cobros.utils.test.ts + cobros.service.test.ts en rojo
2. Backend → cobros.service.ts (obtenerCuotasPendientes, registrarAbono)
3. Frontend → ListaCobros.tsx + FormAbono.tsx
4. Conectar: DetalleCliente actualiza cuotas al abonar

---

## Deuda técnica registrada
- [ ] Test: `obtenerSesionActiva()` lanza error si getSession falla (auth.service línea 20)
- [ ] Test: callback `onAuthStateChange` en auth.store (línea 34)
- [ ] DEC-06: Mover `src/components/ui/` a `src/shared/components/ui/` (ejecutar en HU-04)
- [ ] Test: DetalleCliente sin tests propios
- [ ] Test: ListaClientes.tsx onGuardar closures (líneas 48-61)
- [ ] Test: ventas.service.ts compensating delete branch (líneas 37-38)
- [ ] Configurar GitHub Actions (lint + test en cada PR)
- [ ] Configurar Google OAuth en Supabase Dashboard

---

*Última actualización: 2026-04-23 — cierre HU-03 módulo ventas*
