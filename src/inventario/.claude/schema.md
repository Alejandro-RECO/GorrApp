# Schema: inventario
# Migración: 005_crear_productos.sql

## Tablas propias

### productos
| Columna       | Tipo        | Notas                          |
|---------------|-------------|--------------------------------|
| id            | UUID PK     | gen_random_uuid()              |
| user_id       | UUID FK     | → auth.users(id) CASCADE       |
| nombre        | TEXT        | NOT NULL                       |
| precio_venta  | INTEGER     | centavos COP, CHECK > 0        |
| stock_actual  | INTEGER     | DEFAULT 0, CHECK >= 0          |
| stock_minimo  | INTEGER     | DEFAULT 5, CHECK >= 0          |
| activo        | BOOLEAN     | DEFAULT TRUE (soft delete)     |
| created_at    | TIMESTAMPTZ | DEFAULT NOW() NOT NULL         |
| updated_at    | TIMESTAMPTZ | NOT NULL, trigger moddatetime  |

### compras_inventario
| Columna       | Tipo        | Notas                                        |
|---------------|-------------|----------------------------------------------|
| id            | UUID PK     | gen_random_uuid()                            |
| user_id       | UUID FK     | → auth.users(id) CASCADE                     |
| producto_id   | UUID FK     | → productos(id) ON DELETE RESTRICT NOT NULL  |
| cantidad      | INTEGER     | CHECK > 0                                    |
| precio_compra | INTEGER     | centavos COP por unidad, CHECK > 0           |
| total         | INTEGER     | centavos COP (cantidad * precio_compra)      |
| proveedor     | TEXT        | nullable                                     |
| notas         | TEXT        | nullable                                     |
| created_at    | TIMESTAMPTZ | DEFAULT NOW() NOT NULL                       |

*Compras son inmutables — sin updated_at.*

## Lógica de stock
Al registrar una compra el service hace:
1. INSERT en compras_inventario
2. UPDATE productos SET stock_actual = stock_actual + cantidad
3. INSERT en movimientos_caja tipo='compra_mercancia'
Sin transacciones DB — el service maneja el orden y rollback manual si hay error.

## Índices
- idx_productos_user_id → (user_id) WHERE activo=TRUE
- idx_productos_stock_bajo → (user_id, stock_actual, stock_minimo) WHERE activo=TRUE
- idx_compras_inventario_producto → (producto_id, created_at DESC)
- idx_compras_inventario_user → (user_id, created_at DESC)

## RLS
- productos: `productos_user_isolation` — FOR ALL TO authenticated
- compras_inventario: `compras_inventario_user_isolation` — FOR ALL TO authenticated
- USING + WITH CHECK: auth.uid() = user_id
