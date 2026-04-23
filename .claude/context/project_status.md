# Estado del Proyecto — GorrApp
# Actualizar al INICIO y CIERRE de cada sesión

---

## Estado actual
- **Fase**: HU-02 COMPLETADA — módulo clientes con CRUD y vista de deuda
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
- ✅ App.tsx con guardia de sesión (sin sesión → LoginPage)
- ✅ HU-02: módulo clientes CRUD completo (43 tests, 85.45% cobertura)
- ✅ Routing con react-router-dom v7: /clientes y /clientes/:id
- ✅ supabase.mock extendido con mockQueryBuilder (chainable + thenable)

---

## Estructura del módulo clientes (HU-02)
```
src/clientes/
  clientes.types.ts         ← Cliente, CuotaResumen, CrearCliente, ActualizarCliente
  clientes.utils.ts         ← calcularDeudaTotal, estaEnMora
  clientes.service.ts       ← CRUD Supabase + join cuotas vía ventas
  clientes.store.ts         ← Zustand: clientes, cargando, error + acciones
  index.ts                  ← barrel público
  components/
    FormCliente.tsx          ← form con validación inline
    ListaClientes.tsx        ← lista con badge "En mora" y deuda total
    DetalleCliente.tsx       ← detalle con placeholder historial ventas
    __tests__/
      FormCliente.test.tsx
      ListaClientes.test.tsx
  __tests__/
    clientes.utils.test.ts
    clientes.service.test.ts
    clientes.store.test.ts
```

---

## Configuración pendiente — REQUIERE ACCIÓN MANUAL
⚠️ **Supabase OAuth con Google no está configurado todavía.**
1. Supabase Dashboard → Authentication → Providers → Google → Enable
2. Google Cloud Console → OAuth 2.0 Client ID
3. Authorized redirect URI: `https://cwphowtjsowyovikupqj.supabase.co/auth/v1/callback`
4. Pegar Client ID + Secret en Supabase

---

## Siguiente sesión — HU-03: módulo ventas
Tarea: Registrar venta (contado y fiada), cálculo de cuotas.
Secuencia TDD:
1. Testing → ventas.utils.test.ts (calcularCuotas) en rojo
2. Backend → ventas.service.ts + ventas.types.ts
3. Frontend → FormVenta.tsx + ListaVentas.tsx
4. Conectar a clientes.store para mostrar ventas en DetalleCliente

---

## Deuda técnica registrada
- [ ] Test: `obtenerSesionActiva()` lanza error si getSession falla (auth.service línea 20)
- [ ] Test: callback `onAuthStateChange` en auth.store (línea 34)
- [ ] DEC-06: Mover `src/components/ui/` a `src/shared/components/ui/` (2do módulo usa shadcn — condición cumplida, ejecutar en HU-03 o sesión separada)
- [ ] Test: DetalleCliente (componente sin tests propios)
- [ ] Test: ListaClientes.tsx onGuardar closures (líneas 48-61)
- [ ] Configurar GitHub Actions (lint + test en cada PR)
- [ ] Configurar Google OAuth en Supabase Dashboard

---

*Última actualización: 2026-04-23 — cierre HU-02 módulo clientes*
