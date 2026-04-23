# Módulo: clientes
# Actualizar al INICIO y CIERRE de cada sesión que toque este módulo

## Estado
- **Fase**: HU-02 COMPLETADA
- **HUs completadas**: HU-02 (CRUD + deuda total)

## Decisiones del módulo
- `CuotaResumen` definido en `clientes.types.ts` (no importado de cobros — ese módulo no existe aún)
- `obtenerTodos()` hace join con `ventas(cuotas(...))` via Supabase nested select para obtener deuda
- `calcularDeudaTotal`: suma cuotas estado !== 'pagada' (pendiente + vencida = deuda real)
- `estaEnMora`: any cuota con estado === 'vencida'
- UI importa shadcn desde `@/components/ui/` (DEC-06 pendiente — mover a shared cuando se ejecute)
- `DetalleCliente` tiene placeholder para historial de ventas (se completa en HU-03)

## Pendiente
- Tests de DetalleCliente
- Integrar historial real de ventas en DetalleCliente (HU-03)
- Migrar UI imports a src/shared/components/ui/ (DEC-06)
