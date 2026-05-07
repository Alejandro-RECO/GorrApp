-- migrations/011_crear_ventas_productos.sql
-- Módulo: Ventas — líneas de producto por venta
-- Descripción: Tabla para asociar productos del inventario a cada venta
-- Fecha: 2026-05-06
--
-- EJECUTAR EN SUPABASE DASHBOARD → SQL Editor → Run

CREATE TABLE IF NOT EXISTS ventas_productos (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  venta_id    UUID REFERENCES ventas(id) ON DELETE CASCADE NOT NULL,
  producto_id UUID REFERENCES productos(id) ON DELETE RESTRICT NOT NULL,
  cantidad    INTEGER NOT NULL CHECK (cantidad > 0),
  negocio_id  UUID REFERENCES negocios(id) ON DELETE CASCADE NOT NULL,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ventas_productos_venta   ON ventas_productos(venta_id);
CREATE INDEX IF NOT EXISTS idx_ventas_productos_negocio ON ventas_productos(negocio_id);

ALTER TABLE ventas_productos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ventas_productos_negocio_isolation" ON ventas_productos
  FOR ALL TO authenticated
  USING    (negocio_id = get_negocio_id_for_user())
  WITH CHECK (negocio_id = get_negocio_id_for_user());
