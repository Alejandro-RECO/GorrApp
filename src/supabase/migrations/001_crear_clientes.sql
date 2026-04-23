-- migrations/001_crear_clientes.sql
-- Módulo: clientes
-- Descripción: Tabla de clientes del negocio de gorras
-- Fecha: 2026-04-22

-- Extensión requerida para triggers de updated_at (Supabase la incluye por defecto)
CREATE EXTENSION IF NOT EXISTS moddatetime SCHEMA extensions;

-- ============================================================
-- TABLA: clientes
-- ============================================================

CREATE TABLE IF NOT EXISTS clientes (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nombre      TEXT NOT NULL,
  telefono    TEXT NOT NULL,
  notas       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger updated_at automático
CREATE OR REPLACE TRIGGER set_updated_at_clientes
  BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- ============================================================
-- ÍNDICES
-- ============================================================

-- Buscar clientes por nombre (búsqueda frecuente)
CREATE INDEX IF NOT EXISTS idx_clientes_user_id
  ON clientes(user_id);

CREATE INDEX IF NOT EXISTS idx_clientes_nombre
  ON clientes(user_id, nombre);
