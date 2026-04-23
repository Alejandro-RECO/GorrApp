-- migrations/004_crear_movimientos_caja.sql
-- Módulo: caja
-- Descripción: Tabla de movimientos de caja (entradas y salidas de dinero)
-- Fecha: 2026-04-22
-- Depende de: ninguna tabla de negocio (referencia_id es soft reference)

-- ============================================================
-- TABLA: movimientos_caja
-- ============================================================

-- Tipos de movimiento:
--   ingreso_venta      → venta contado registrada
--   ingreso_abono      → abono a cuota fiada recibido
--   gasto_operativo    → gasto del día a día (transporte, empaque, etc.)
--   gasto_inversion    → compra de mercancía para revender
--   compra_mercancia   → alias semántico de gasto_inversion (puede unificarse en el futuro)

-- referencia_id es una FK soft (sin constraint) al id de la venta o abono.
-- No forzamos FK aquí para no acoplar caja a ventas/cobros en nivel DB.
-- La integridad se garantiza en el service de caja.

CREATE TABLE IF NOT EXISTS movimientos_caja (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tipo          TEXT NOT NULL
                CHECK (tipo IN (
                  'ingreso_venta',
                  'ingreso_abono',
                  'gasto_operativo',
                  'gasto_inversion',
                  'compra_mercancia'
                )),
  valor         INTEGER NOT NULL CHECK (valor > 0),  -- centavos COP, siempre positivo
  medio_pago    TEXT NOT NULL
                CHECK (medio_pago IN ('efectivo', 'digital')),
  descripcion   TEXT NOT NULL,
  referencia_id UUID,                                -- id de venta o abono, opcional
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
  -- Sin updated_at: los movimientos de caja son inmutables
);

-- ============================================================
-- ÍNDICES
-- ============================================================

-- Movimientos del día (vista principal de caja)
CREATE INDEX IF NOT EXISTS idx_movimientos_caja_user_fecha
  ON movimientos_caja(user_id, created_at DESC);

-- Filtrar por tipo (ingresos vs gastos)
CREATE INDEX IF NOT EXISTS idx_movimientos_caja_tipo
  ON movimientos_caja(user_id, tipo);

-- Filtrar por medio de pago (efectivo vs digital)
CREATE INDEX IF NOT EXISTS idx_movimientos_caja_medio
  ON movimientos_caja(user_id, medio_pago);
