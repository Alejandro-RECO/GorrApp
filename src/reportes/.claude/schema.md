# Schema: reportes
# Migración: ninguna — sin tablas propias

## Tablas propias
Ninguna. Reportes es un módulo de solo lectura que agrega datos de otros módulos.

## Tablas que consume (lectura)
- clientes (módulo clientes)
- ventas (módulo ventas)
- cuotas, abonos (módulo cobros)
- movimientos_caja (módulo caja)
- productos, compras_inventario (módulo inventario)

## Estrategia de queries
- Queries directas a Supabase desde el service de reportes
- No accede a los stores de otros módulos — solo a la DB
- Considerar views de Supabase cuando las queries sean demasiado complejas

## Candidatos a vista SQL (post-MVP)
- `vista_cartera_pendiente` — sum de cuotas pendientes por cliente
- `vista_saldo_caja_dia` — ingresos vs egresos del día por medio de pago
- `vista_ventas_mes` — total ventas agrupadas por semana del mes
