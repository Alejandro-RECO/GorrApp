-- migrations/006_rls_policies.sql
-- Módulo: todos
-- Descripción: Row Level Security para todas las tablas del MVP
-- Fecha: 2026-04-22
-- Depende de: 001 al 005 — ejecutar ÚLTIMO

-- ============================================================
-- PRINCIPIO: cada usuario solo accede a sus propios registros.
-- GorrApp es un sistema single-operator: un usuario por cuenta.
-- No hay roles admin ni multi-tenant en el MVP.
-- ============================================================

-- ============================================================
-- TABLA: clientes
-- ============================================================

ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clientes_user_isolation"
  ON clientes
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TABLA: ventas
-- ============================================================

ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ventas_user_isolation"
  ON ventas
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TABLA: cuotas
-- ============================================================

ALTER TABLE cuotas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cuotas_user_isolation"
  ON cuotas
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TABLA: abonos
-- ============================================================

ALTER TABLE abonos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "abonos_user_isolation"
  ON abonos
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TABLA: movimientos_caja
-- ============================================================

ALTER TABLE movimientos_caja ENABLE ROW LEVEL SECURITY;

CREATE POLICY "movimientos_caja_user_isolation"
  ON movimientos_caja
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TABLA: productos
-- ============================================================

ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "productos_user_isolation"
  ON productos
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- TABLA: compras_inventario
-- ============================================================

ALTER TABLE compras_inventario ENABLE ROW LEVEL SECURITY;

CREATE POLICY "compras_inventario_user_isolation"
  ON compras_inventario
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
