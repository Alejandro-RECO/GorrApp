-- migrations/005_crear_productos.sql
-- Módulo: inventario
-- Descripción: Tablas de productos y compras de inventario
-- Fecha: 2026-04-22
-- Depende de: ninguna tabla de negocio

-- ============================================================
-- TABLA: productos
-- ============================================================

-- Modelo simplificado para el MVP: sin tallas ni colores.
-- precio_venta es el precio sugerido; el operador puede vender a otro precio.
-- stock_actual se incrementa en compras y se decrementa en ventas (manualmente).

CREATE TABLE IF NOT EXISTS productos (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nombre        TEXT NOT NULL,
  precio_venta  INTEGER NOT NULL CHECK (precio_venta > 0),  -- centavos COP
  stock_actual  INTEGER NOT NULL DEFAULT 0 CHECK (stock_actual >= 0),
  stock_minimo  INTEGER NOT NULL DEFAULT 5 CHECK (stock_minimo >= 0),
  activo        BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at    TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Trigger updated_at automático
CREATE OR REPLACE TRIGGER set_updated_at_productos
  BEFORE UPDATE ON productos
  FOR EACH ROW EXECUTE FUNCTION extensions.moddatetime(updated_at);

-- ============================================================
-- TABLA: compras_inventario
-- ============================================================

-- Registra cada compra de mercancía al proveedor.
-- Efecto dual: incrementa stock de producto + genera movimiento_caja gasto_inversion.
-- La consistencia de ambas operaciones se garantiza en el service de inventario
-- usando una transacción lógica (dos inserts seguidos).

CREATE TABLE IF NOT EXISTS compras_inventario (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  producto_id     UUID REFERENCES productos(id) ON DELETE RESTRICT NOT NULL,
  cantidad        INTEGER NOT NULL CHECK (cantidad > 0),
  precio_compra   INTEGER NOT NULL CHECK (precio_compra > 0),  -- centavos COP por unidad
  total           INTEGER NOT NULL CHECK (total > 0),          -- centavos COP (cantidad * precio_compra)
  proveedor       TEXT,
  notas           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW() NOT NULL
  -- Sin updated_at: las compras son inmutables (historial contable)
);

-- ============================================================
-- ÍNDICES
-- ============================================================

-- Listado de productos del usuario
CREATE INDEX IF NOT EXISTS idx_productos_user_id
  ON productos(user_id)
  WHERE activo = TRUE;

-- Productos con stock bajo (alertas)
CREATE INDEX IF NOT EXISTS idx_productos_stock_bajo
  ON productos(user_id, stock_actual, stock_minimo)
  WHERE activo = TRUE;

-- Historial de compras por producto
CREATE INDEX IF NOT EXISTS idx_compras_inventario_producto
  ON compras_inventario(producto_id, created_at DESC);

-- Historial de compras del usuario
CREATE INDEX IF NOT EXISTS idx_compras_inventario_user
  ON compras_inventario(user_id, created_at DESC);
