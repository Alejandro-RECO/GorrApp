-- migrations/003_crear_cuotas_abonos.sql
-- Módulo: cobros
-- Descripción: Tablas de cuotas y abonos para ventas fiadas
-- Fecha: 2026-04-22
-- Depende de: 002_crear_ventas.sql

-- ============================================================
-- TABLA: cuotas
-- ============================================================

-- Reglas de negocio:
-- - fiado_una_cuota  → 1 cuota, vence a 30 días de la venta
-- - fiado_dos_cuotas → 2 cuotas: cuota 1 vence a 15 días, cuota 2 a 30 días

CREATE TABLE IF NOT EXISTS cuotas (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  venta_id          UUID REFERENCES ventas(id) ON DELETE CASCADE NOT NULL,
  numero_cuota      INTEGER NOT NULL CHECK (numero_cuota IN (1, 2)),
  valor             INTEGER NOT NULL CHECK (valor > 0),  -- centavos COP
  fecha_vencimiento DATE NOT NULL,
  estado            TEXT NOT NULL DEFAULT 'pendiente'
                    CHECK (estado IN ('pendiente', 'pagada', 'vencida')),
  created_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at        TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger updated_at automático
CREATE OR REPLACE TRIGGER set_updated_at_cuotas
  BEFORE UPDATE ON cuotas
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- Una venta no puede tener dos cuotas con el mismo número
CREATE UNIQUE INDEX IF NOT EXISTS idx_cuotas_venta_numero
  ON cuotas(venta_id, numero_cuota);

-- ============================================================
-- TABLA: abonos
-- ============================================================

-- Un abono es un pago parcial o total a una cuota.
-- La cuota se marca pagada cuando sum(abonos) >= valor_cuota.
-- Esa lógica vive en el service de cobros, no en trigger SQL.

CREATE TABLE IF NOT EXISTS abonos (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cuota_id    UUID REFERENCES cuotas(id) ON DELETE CASCADE NOT NULL,
  valor       INTEGER NOT NULL CHECK (valor > 0),  -- centavos COP
  medio_pago  TEXT NOT NULL
              CHECK (medio_pago IN ('efectivo', 'digital')),
  notas       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
  -- Sin updated_at: los abonos no se editan, solo se crean
);

-- ============================================================
-- ÍNDICES
-- ============================================================

-- Cuotas pendientes del usuario (vista principal de cobros)
CREATE INDEX IF NOT EXISTS idx_cuotas_user_estado
  ON cuotas(user_id, estado);

-- Cuotas por venta (para mostrar estado de una venta fiada)
CREATE INDEX IF NOT EXISTS idx_cuotas_venta_id
  ON cuotas(venta_id);

-- Cuotas vencidas por fecha (para alertas de mora)
CREATE INDEX IF NOT EXISTS idx_cuotas_vencimiento
  ON cuotas(user_id, fecha_vencimiento)
  WHERE estado = 'pendiente';

-- Abonos por cuota (para calcular saldo de una cuota)
CREATE INDEX IF NOT EXISTS idx_abonos_cuota_id
  ON abonos(cuota_id);

-- Historial de abonos del usuario
CREATE INDEX IF NOT EXISTS idx_abonos_user_id
  ON abonos(user_id, created_at DESC);
