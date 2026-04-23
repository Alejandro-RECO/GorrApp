# Skill: Git
# Versión: 1.0.0
# Aplica a: todos los agentes cuando hacen commits o manejan branches
# Cuándo cargar: al inicio de sesión y antes de cualquier commit

---

## ESTRUCTURA DE BRANCHES

```
main         ← producción — siempre verde, deploy automático a Vercel
develop      ← integración — tests siempre pasando, base para features
feature/     ← una rama por Historia de Usuario
fix/         ← correcciones puntuales
```

### Crear una rama de feature (PowerShell)
```powershell
git checkout develop
git pull origin develop
git checkout -b feature/HU-01-registrar-venta
```

### Regla de vida de una rama feature
Una rama feature nace cuando empieza la HU y muere cuando hace merge a develop.
No acumular múltiples HUs en una rama. No dejar ramas feature abiertas más de
3 días sin actividad.

---

## CONVENCIÓN DE COMMITS — CONVENTIONAL COMMITS

Formato obligatorio:
```
tipo(módulo): descripción en presente imperativo
```

### Tipos válidos
```
feat      ← nueva funcionalidad (código de producción)
fix       ← corrección de bug
test      ← agregar o modificar tests
refactor  ← cambio de código sin cambiar comportamiento
docs      ← cambios en documentación o archivos .md
chore     ← configuración, dependencias, archivos de build
```

### Módulos válidos
```
ventas | clientes | caja | inventario | cobros | reportes | auth | shared
```

### Ejemplos correctos
```
feat(ventas): agregar función calcularCuotas para ventas fiadas
test(ventas): agregar tests para calcularCuotas con 2 cuotas
refactor(ventas): simplificar lógica de validación de venta
fix(cobros): corregir cálculo de días vencidos
docs(agentes): actualizar context.md del módulo ventas
chore: agregar configuración de Playwright
```

### Ejemplos incorrectos
```
feat: cambios                          ← sin módulo, descripción vacía
Update ventas                          ← sin tipo, sin módulo
feat(ventas): Agregué la función...    ← pasado, no presente imperativo
WIP                                    ← nunca commitear trabajo incompleto
```

---

## REGLA DE ORO DE COMMITS

**Solo se hace commit cuando los tests están en verde.**

Nunca:
```powershell
git add .
git commit -m "feat(ventas): trabajo en progreso"   # PROHIBIDO
```

Siempre:
```powershell
bun test --run   # confirmar verde
git add .
git commit -m "feat(ventas): agregar cálculo de cuotas para venta fiada"
```

Si el trabajo está incompleto al cerrar la sesión, el commit va en la
rama feature (nunca en develop), con todos los tests que existen pasando.
Los tests de la próxima funcionalidad pueden estar en rojo en la rama feature,
pero los tests de funcionalidad ya terminada deben estar en verde.

---

## FLUJO DE MERGE A DEVELOP

```powershell
# 1. Asegurarse que develop está actualizado
git checkout develop
git pull origin develop

# 2. Volver a la rama feature y hacer rebase
git checkout feature/HU-01-registrar-venta
git rebase develop

# 3. Correr todos los tests
bun test --run

# 4. Si todo verde, merge a develop
git checkout develop
git merge --no-ff feature/HU-01-registrar-venta
git push origin develop

# 5. Eliminar la rama feature
git branch -d feature/HU-01-registrar-venta
```

---

## .gitignore MÍNIMO PARA ESTE PROYECTO

Estos archivos nunca se commitean:
```
node_modules/
.env
.env.local
.env.production
dist/
.vercel/
coverage/
playwright-report/
test-results/
*.local
```

El archivo `.env.example` SÍ se commitea con las variables necesarias
pero sin valores reales.

---

## GESTIÓN DE TOKENS CON GIT

Esta skill es corta por diseño. El Orquestador la carga completa en cada
sesión porque pesa poco y evita errores de commit que cuestan tiempo de
corrección — tiempo que en sesiones cortas es muy valioso.

---

*Git skill v1.0.0 — actualizar si cambia la estrategia de branching*