-- migrations/002_crear_ventas.sql
-- Módulo: ventas
-- Descripción: Tabla de ventas (contado y fiadas) con referencia a clientes
-- Fecha: 2026-04-22
-- Depende de: 001_crear_clientes.sql

-- ============================================================
-- TABLA: ventas
-- ============================================================

CREATE TABLE IF NOT EXISTS ventas (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  cliente_id  UUID REFERENCES clientes(id) ON DELETE RESTRICT NOT NULL,
  total       INTEGER NOT NULL CHECK (total > 0),   -- centavos COP
  tipo        TEXT NOT NULL
              CHECK (tipo IN ('contado', 'fiado_una_cuota', 'fiado_dos_cuotas')),
  medio_pago  TEXT NOT NULL
              CHECK (medio_pago IN ('efectivo', 'digital')),
  notas       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger updated_at automático
CREATE OR REPLACE TRIGGER set_updated_at_ventas
  BEFORE UPDATE ON ventas
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- ============================================================
-- ÍNDICES
-- ============================================================

-- Consultas por usuario (listado principal)
CREATE INDEX IF NOT EXISTS idx_ventas_user_id
  ON ventas(user_id);

-- Historial de ventas por cliente
CREATE INDEX IF NOT EXISTS idx_ventas_cliente_id
  ON ventas(cliente_id);

-- Filtrar ventas por tipo (fiadas vs contado)
CREATE INDEX IF NOT EXISTS idx_ventas_tipo
  ON ventas(user_id, tipo);

-- Listado cronológico (vista principal del módulo)
CREATE INDEX IF NOT EXISTS idx_ventas_created_at
  ON ventas(user_id, created_at DESC);
