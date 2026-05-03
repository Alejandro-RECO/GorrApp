# Módulo: cobros
# Actualizar al INICIO y CIERRE de cada sesión que toque este módulo

## Estado
- **Fase**: HU-04 COMPLETADA — pendiente merge a master
- **HUs completadas**: HU-04 (gestionar cuotas pendientes + registrar abonos)

## Decisiones del módulo
- `CuotaConCliente` incluye join ventas→clientes via Supabase nested select
- `registrarAbono`: después de insertar abono, re-fetch cuota con abonos para calcular saldo
- `registrarAbono`: auto-actualiza estado cuota a 'pagada' si saldo <= 0
- `generarMensajeCobro`: usa `formatearPesos` para mostrar total en COP (no entero crudo)
- `ListaCobros`: ordena vencidas primero, luego por fecha_vencimiento ascendente
- `FormAbono` y `MensajeCobro` son Dialogs — se montan condicionalmente en ListaCobros
- Store `cargarAbonos` propaga error al store (no silencioso)

## Pendiente
- Branch coverage en cobros.service.ts 55% — faltan ramas de error (líneas 13-14, 29-60)
- Dialog `handleOpenChange` callbacks sin cobertura (functions 72%)
