# Estado del Proyecto — GorrApp
# Actualizar al INICIO y CIERRE de cada sesión

---

## Estado actual
- **Fase**: HU-01 COMPLETADA — login con Google funcionando
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
- ✅ Reviewer: APROBADO CON OBSERVACIONES

---

## Estructura del módulo auth
```
src/auth/
  auth.types.ts           ← Session, AuthState
  auth.service.ts         ← loginConGoogle, cerrarSesion, obtenerSesionActiva
  auth.store.ts           ← Zustand: session, cargando, inicializarSesion
  index.ts                ← barrel: useAuthStore, Session, AuthState
  components/
    LoginPage.tsx         ← página de login mobile-first
    __tests__/
      LoginPage.test.tsx
  __tests__/
    auth.service.test.ts
    auth.store.test.ts
```

---

## Configuración pendiente — REQUIERE ACCIÓN MANUAL
⚠️ **Supabase OAuth con Google no está configurado todavía.**
Para que el login funcione en el navegador:
1. Supabase Dashboard → Authentication → Providers → Google → Enable
2. Google Cloud Console → OAuth 2.0 Client ID
3. Authorized redirect URI: `https://cwphowtjsowyovikupqj.supabase.co/auth/v1/callback`
4. Pegar Client ID + Secret en Supabase

---

## Siguiente sesión — HU-02: módulo clientes
Tarea: CRUD completo de clientes (crear, listar, ver detalle)
Secuencia TDD:
1. Testing → clientes.utils.test.ts + clientes.service.test.ts en rojo
2. Backend → clientes.service.ts + clientes.types.ts
3. Frontend → ListaClientes.tsx + FormCliente.tsx
4. Routing con react-router-dom (primera ruta real post-login)

---

## Deuda técnica registrada
- [ ] Test: `obtenerSesionActiva()` lanza error si getSession falla (auth.service línea 20)
- [ ] Test: callback `onAuthStateChange` en auth.store (línea 34)
- [ ] Mover `src/components/ui/` a `src/shared/components/ui/` (DEC-06, cuando 2do módulo los use)
- [ ] Configurar GitHub Actions (lint + test en cada PR)
- [ ] Configurar Google OAuth en Supabase Dashboard

---

*Última actualización: 2026-04-22 — cierre HU-01 auth login Google*
