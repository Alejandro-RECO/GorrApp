# Schema: cobros
# Migración: 003_crear_cuotas_abonos.sql

## Tablas propias

### cuotas
| Columna          | Tipo        | Notas                                        |
|------------------|-------------|----------------------------------------------|
| id               | UUID PK     | gen_random_uuid()                            |
| user_id          | UUID FK     | → auth.users(id) CASCADE                     |
| venta_id         | UUID FK     | → ventas(id) ON DELETE CASCADE NOT NULL      |
| numero_cuota     | INTEGER     | CHECK IN (1, 2)                              |
| valor            | INTEGER     | centavos COP, CHECK > 0                      |
| fecha_vencimiento| DATE        | NOT NULL                                     |
| estado           | TEXT        | 'pendiente' \| 'pagada' \| 'vencida'         |
| created_at       | TIMESTAMPTZ | DEFAULT NOW() NOT NULL                       |
| updated_at       | TIMESTAMPTZ | NOT NULL, trigger moddatetime                |

**Reglas de negocio:**
- fiado_una_cuota → 1 cuota, vence 30 días desde created_at de venta
- fiado_dos_cuotas → cuota 1 vence 15 días, cuota 2 vence 30 días
- Estado se actualiza cuando sum(abonos.valor) >= cuotas.valor
- Unique: (venta_id, numero_cuota)

### abonos
| Columna    | Tipo        | Notas                             |
|------------|-------------|-----------------------------------|
| id         | UUID PK     | gen_random_uuid()                 |
| user_id    | UUID FK     | → auth.users(id) CASCADE          |
| cuota_id   | UUID FK     | → cuotas(id) ON DELETE CASCADE    |
| valor      | INTEGER     | centavos COP, CHECK > 0           |
| medio_pago | TEXT        | 'efectivo' \| 'digital'           |
| notas      | TEXT        | nullable                          |
| created_at | TIMESTAMPTZ | DEFAULT NOW() NOT NULL            |

*Abonos son inmutables — sin updated_at.*

## Índices
- idx_cuotas_user_estado → (user_id, estado)
- idx_cuotas_venta_id → (venta_id)
- idx_cuotas_vencimiento → (user_id, fecha_vencimiento) WHERE estado='pendiente'
- idx_abonos_cuota_id → (cuota_id)
- idx_abonos_user_id → (user_id, created_at DESC)

## RLS
- cuotas: `cuotas_user_isolation` — FOR ALL TO authenticated
- abonos: `abonos_user_isolation` — FOR ALL TO authenticated
- USING + WITH CHECK: auth.uid() = user_id
