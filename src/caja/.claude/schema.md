# Schema: caja
# Migración: 004_crear_movimientos_caja.sql

## Tablas propias

### movimientos_caja
| Columna      | Tipo        | Notas                                                                                              |
|--------------|-------------|----------------------------------------------------------------------------------------------------|
| id           | UUID PK     | gen_random_uuid()                                                                                  |
| user_id      | UUID FK     | → auth.users(id) CASCADE                                                                           |
| tipo         | TEXT        | 'ingreso_venta' \| 'ingreso_abono' \| 'gasto_operativo' \| 'gasto_inversion' \| 'compra_mercancia'|
| valor        | INTEGER     | centavos COP, siempre positivo, CHECK > 0                                                          |
| medio_pago   | TEXT        | 'efectivo' \| 'digital'                                                                            |
| descripcion  | TEXT        | NOT NULL — texto libre del operador                                                                |
| referencia_id| UUID        | nullable — id de venta o abono (soft reference, sin FK)                                            |
| fecha        | DATE        | NOT NULL — fecha del movimiento (filtro principal de ListaMovimientos)                             |
| created_at   | TIMESTAMPTZ | DEFAULT NOW() NOT NULL                                                                             |

*Movimientos son inmutables — sin updated_at. Nunca se editan.*
*⚠️ Migración pendiente: ADD COLUMN fecha DATE NOT NULL DEFAULT CURRENT_DATE en movimientos_caja*

## Lógica de saldos
El saldo de caja NO vive en la DB. Se calcula en el service:
- Saldo efectivo = sum(valor WHERE medio_pago='efectivo' AND tipo IN ingreso) - sum(valor WHERE medio_pago='efectivo' AND tipo IN gasto)
- Saldo digital = ídem para medio_pago='digital'

## Índices
- idx_movimientos_caja_user_fecha → (user_id, created_at DESC)
- idx_movimientos_caja_tipo → (user_id, tipo)
- idx_movimientos_caja_medio → (user_id, medio_pago)

## RLS
- Policy: `movimientos_caja_user_isolation` — FOR ALL TO authenticated
- USING + WITH CHECK: auth.uid() = user_id
