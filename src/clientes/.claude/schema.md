# Schema: clientes
# Migración: 001_crear_clientes.sql

## Tablas propias

### clientes
| Columna    | Tipo        | Notas                         |
|------------|-------------|-------------------------------|
| id         | UUID PK     | gen_random_uuid()             |
| user_id    | UUID FK     | → auth.users(id) CASCADE      |
| nombre     | TEXT        | NOT NULL                      |
| telefono   | TEXT        | NOT NULL                      |
| notas      | TEXT        | nullable                      |
| created_at | TIMESTAMPTZ | DEFAULT NOW() NOT NULL        |
| updated_at | TIMESTAMPTZ | NOT NULL, trigger moddatetime |

## Índices
- idx_clientes_user_id → (user_id)
- idx_clientes_nombre → (user_id, nombre)

## RLS
- Policy: `clientes_user_isolation` — FOR ALL TO authenticated
- USING + WITH CHECK: auth.uid() = user_id

## Relaciones entrantes
- ventas.cliente_id → clientes.id (ON DELETE RESTRICT)
