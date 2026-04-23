# Módulo: ventas
# Actualizar al INICIO y CIERRE de cada sesión que toque este módulo

## Estado
- **Fase**: HU-03 COMPLETADA
- **HUs completadas**: HU-03 (registrar venta contado y fiada)

## Decisiones del módulo
- `CuotaCalculada` definida en `ventas.types.ts` (no importada de cobros)
- `calcularCuotas`: cuota 2 = `total - valorCuota1` para evitar error con totales impares
- `crear()` service: transacción con compensating delete si cuotas insert falla
- `ListaVentas` acepta `clienteId?: string` prop para uso en DetalleCliente
- FormVenta usa native `<select>` (no shadcn Select) para mejor testabilidad
- Composición DetalleCliente + ListaVentas ocurre en app/router.tsx (no en clientes module)

## Pendiente
- Test compensating delete branch (ventas.service.ts líneas 37-38)
- ResumenCuotas: rama `cuotas.length === 0` (línea 9) sin cobertura
