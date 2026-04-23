# Skill: TDD
# Versión: 1.0.0
# Aplica a: todos los agentes sin excepción
# Cuándo cargar: siempre que se vaya a escribir o modificar código

---

## LA REGLA ÚNICA

Ningún código de producción puede existir sin un test que lo exija.

No hay excepciones. No hay "es solo un helper". No hay "lo testeo después".
Si no hay test, no se escribe el código. Punto.

---

## EL CICLO — TRES FASES, EN ORDEN

### FASE 1 — RED (test en rojo)
El Agente Testing escribe el test.
El test falla porque el código no existe todavía.
Correr `bun test --run` y confirmar que falla con el error esperado
(not found / undefined), no con un error de sintaxis.

Un test que falla por error de sintaxis no es un test en rojo válido.
Arreglar la sintaxis antes de pasar a la Fase 2.

### FASE 2 — GREEN (código mínimo)
El Agente Frontend o Backend escribe el código mínimo para pasar el test.
"Mínimo" significa literalmente lo mínimo. No anticipar requisitos futuros.
No agregar parámetros que el test no pide. No manejar casos que no están testeados.

Correr `bun test --run` y confirmar verde antes de continuar.
Si hay otros tests que ahora fallan (regresión), resolverlos antes de avanzar.

### FASE 3 — REFACTOR (mejorar sin romper)
Con todos los tests en verde, mejorar el código:
- eliminar duplicación
- mejorar nombres
- simplificar lógica
- aplicar patrones del proyecto

Correr `bun test --run` después de cada cambio de refactor.
Si algo se pone rojo durante el refactor, deshacer ese cambio específico.

---

## LO QUE NO ES TDD

Estas prácticas rompen el ciclo y están prohibidas:

```
PROHIBIDO: escribir código y luego escribir tests para ese código
PROHIBIDO: escribir tests que ya pasan (test en verde desde el inicio)
PROHIBIDO: commitear con tests en rojo
PROHIBIDO: skipear tests con it.skip() sin dejar un TODO documentado
PROHIBIDO: escribir tests que prueban implementación (cómo está hecho)
PROHIBIDO: escribir tests que solo prueban que el mock funciona
```

---

## SEÑALES DE QUE EL TDD ESTÁ FUNCIONANDO

- Los tests leen como especificación del negocio, no como código técnico
- Hacer refactor no rompe tests
- Al leer un test se entiende qué hace el sistema sin leer el código
- El código de producción no tiene lógica que ningún test ejercita

## SEÑALES DE QUE EL TDD ESTÁ ROTO

- Hay que cambiar tests cuando se hace refactor interno
- Los tests son más difíciles de leer que el código que prueban
- Se necesitan mocks complejos para probar lógica simple
- La cobertura es alta pero los bugs igual aparecen en producción

---

## TAMAÑO DE CADA CICLO

Cada ciclo RED → GREEN → REFACTOR debe completarse en menos de 20 minutos.
Si un ciclo tarda más, la tarea es demasiado grande. Partirla en ciclos más pequeños.

Con sesiones de trabajo cortas (menos de 1 hora), el objetivo es completar
entre 2 y 4 ciclos por sesión. Más de 4 ciclos en una sesión significa que
los ciclos son demasiado pequeños y se está perdiendo foco.

---

## GESTIÓN DE TOKENS EN EL CICLO TDD

Para maximizar el contexto disponible en cada sesión:

En la Fase RED: cargar solo domain.md + context del módulo activo.
No cargar patterns.md ni decisions.md salvo que el test requiera entender un patrón.

En la Fase GREEN: cargar el test recién escrito + patterns.md si es necesario.
No recargar domain.md (ya está en contexto de la fase anterior).

En la Fase REFACTOR: no se necesita contexto adicional.
El código y los tests en verde son suficiente información.

---

*TDD skill v1.0.0 — esta skill no cambia salvo que cambie el stack de testing*