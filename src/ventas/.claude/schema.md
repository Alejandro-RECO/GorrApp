# Schema: ventas
# Migración: 002_crear_ventas.sql

## Tablas propias

### ventas
| Columna    | Tipo        | Notas                                                    |
|------------|-------------|----------------------------------------------------------|
| id         | UUID PK     | gen_random_uuid()                                        |
| user_id    | UUID FK     | → auth.users(id) CASCADE                                 |
| cliente_id | UUID FK     | → clientes(id) ON DELETE RESTRICT NOT NULL               |
| total      | INTEGER     | centavos COP, CHECK > 0                                  |
| tipo       | TEXT        | 'contado' \| 'fiado_una_cuota' \| 'fiado_dos_cuotas'     |
| medio_pago | TEXT        | 'efectivo' \| 'digital'                                  |
| notas      | TEXT        | nullable                                                 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() NOT NULL                                   |
| updated_at | TIMESTAMPTZ | NOT NULL, trigger moddatetime                            |

## Índices
- idx_ventas_user_id → (user_id)
- idx_ventas_cliente_id → (cliente_id)
- idx_ventas_tipo → (user_id, tipo)
- idx_ventas_created_at → (user_id, created_at DESC)

## RLS
- Policy: `ventas_user_isolation` — FOR ALL TO authenticated
- USING + WITH CHECK: auth.uid() = user_id

## Relaciones entrantes
- cuotas.venta_id → ventas(id) ON DELETE CASCADE
