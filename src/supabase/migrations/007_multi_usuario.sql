-- migrations/007_multi_usuario.sql
-- Módulo: Multi-usuario / Negocio compartido
-- Descripción: Agrega soporte para múltiples usuarios en el mismo negocio
-- Fecha: 2026-05-05
-- DEC-09: negocio_id reemplaza user_id como eje de aislamiento de datos
--
-- EJECUTAR EN SUPABASE DASHBOARD → SQL Editor → Run
-- EJECUTAR EN UNA SOLA TRANSACCIÓN (todo o nada)

BEGIN;

-- ============================================================
-- TABLAS NUEVAS
-- ============================================================

-- negocios: entidad que representa el negocio compartido
CREATE TABLE IF NOT EXISTS negocios (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre      TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- profiles: mapeo 1-a-1 entre usuario de auth y negocio
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  negocio_id  UUID REFERENCES negocios(id) ON DELETE CASCADE NOT NULL,
  email       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id)
);

CREATE INDEX IF NOT EXISTS idx_profiles_user_id    ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_negocio_id ON profiles(negocio_id);

-- invitaciones: códigos de acceso de 8 chars, expiran en 48h, un solo uso
CREATE TABLE IF NOT EXISTS invitaciones (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  negocio_id  UUID REFERENCES negocios(id) ON DELETE CASCADE NOT NULL,
  codigo      TEXT NOT NULL UNIQUE,
  creado_por  UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  usado_por   UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  usado_at    TIMESTAMPTZ,
  expira_at   TIMESTAMPTZ NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_invitaciones_codigo   ON invitaciones(codigo);
CREATE INDEX IF NOT EXISTS idx_invitaciones_negocio  ON invitaciones(negocio_id);

-- ============================================================
-- AGREGAR negocio_id A LAS 7 TABLAS EXISTENTES (nullable primero)
-- ============================================================

ALTER TABLE clientes          ADD COLUMN IF NOT EXISTS negocio_id UUID REFERENCES negocios(id) ON DELETE CASCADE;
ALTER TABLE ventas             ADD COLUMN IF NOT EXISTS negocio_id UUID REFERENCES negocios(id) ON DELETE CASCADE;
ALTER TABLE cuotas             ADD COLUMN IF NOT EXISTS negocio_id UUID REFERENCES negocios(id) ON DELETE CASCADE;
ALTER TABLE abonos             ADD COLUMN IF NOT EXISTS negocio_id UUID REFERENCES negocios(id) ON DELETE CASCADE;
ALTER TABLE movimientos_caja   ADD COLUMN IF NOT EXISTS negocio_id UUID REFERENCES negocios(id) ON DELETE CASCADE;
ALTER TABLE productos          ADD COLUMN IF NOT EXISTS negocio_id UUID REFERENCES negocios(id) ON DELETE CASCADE;
ALTER TABLE compras_inventario ADD COLUMN IF NOT EXISTS negocio_id UUID REFERENCES negocios(id) ON DELETE CASCADE;

-- ============================================================
-- MIGRACIÓN DE DATOS EXISTENTES
-- Crea un negocio por cada usuario que tenga datos, luego backfill.
-- ============================================================

DO $$
DECLARE
  rec RECORD;
  nuevo_negocio_id UUID;
BEGIN
  -- Para cada usuario único que aparece en cualquier tabla de datos:
  FOR rec IN
    SELECT DISTINCT user_id FROM (
      SELECT user_id FROM clientes
      UNION ALL SELECT user_id FROM ventas
      UNION ALL SELECT user_id FROM productos
      UNION ALL SELECT user_id FROM movimientos_caja
    ) t
  LOOP
    -- Solo si no tiene profile todavía
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE user_id = rec.user_id) THEN
      -- Crear negocio
      INSERT INTO negocios (nombre) VALUES ('Mi Negocio')
      RETURNING id INTO nuevo_negocio_id;

      -- Crear profile
      INSERT INTO profiles (user_id, negocio_id)
      VALUES (rec.user_id, nuevo_negocio_id);
    END IF;
  END LOOP;
END $$;

-- Backfill negocio_id en las 7 tablas
UPDATE clientes c
  SET negocio_id = p.negocio_id
  FROM profiles p
  WHERE c.user_id = p.user_id AND c.negocio_id IS NULL;

UPDATE ventas v
  SET negocio_id = p.negocio_id
  FROM profiles p
  WHERE v.user_id = p.user_id AND v.negocio_id IS NULL;

UPDATE cuotas c
  SET negocio_id = p.negocio_id
  FROM profiles p
  WHERE c.user_id = p.user_id AND c.negocio_id IS NULL;

UPDATE abonos a
  SET negocio_id = p.negocio_id
  FROM profiles p
  WHERE a.user_id = p.user_id AND a.negocio_id IS NULL;

UPDATE movimientos_caja m
  SET negocio_id = p.negocio_id
  FROM profiles p
  WHERE m.user_id = p.user_id AND m.negocio_id IS NULL;

UPDATE productos pr
  SET negocio_id = p.negocio_id
  FROM profiles p
  WHERE pr.user_id = p.user_id AND pr.negocio_id IS NULL;

UPDATE compras_inventario ci
  SET negocio_id = p.negocio_id
  FROM profiles p
  WHERE ci.user_id = p.user_id AND ci.negocio_id IS NULL;

-- Ahora que los datos están migrados, forzar NOT NULL
ALTER TABLE clientes          ALTER COLUMN negocio_id SET NOT NULL;
ALTER TABLE ventas             ALTER COLUMN negocio_id SET NOT NULL;
ALTER TABLE cuotas             ALTER COLUMN negocio_id SET NOT NULL;
ALTER TABLE abonos             ALTER COLUMN negocio_id SET NOT NULL;
ALTER TABLE movimientos_caja   ALTER COLUMN negocio_id SET NOT NULL;
ALTER TABLE productos          ALTER COLUMN negocio_id SET NOT NULL;
ALTER TABLE compras_inventario ALTER COLUMN negocio_id SET NOT NULL;

-- ============================================================
-- FUNCIÓN HELPER PARA RLS
-- ============================================================

CREATE OR REPLACE FUNCTION get_negocio_id_for_user()
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT negocio_id FROM profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- ============================================================
-- ACTUALIZAR RLS EN LAS 7 TABLAS EXISTENTES
-- ============================================================

-- Droppear políticas viejas
DROP POLICY IF EXISTS "clientes_user_isolation"          ON clientes;
DROP POLICY IF EXISTS "ventas_user_isolation"            ON ventas;
DROP POLICY IF EXISTS "cuotas_user_isolation"            ON cuotas;
DROP POLICY IF EXISTS "abonos_user_isolation"            ON abonos;
DROP POLICY IF EXISTS "movimientos_caja_user_isolation"  ON movimientos_caja;
DROP POLICY IF EXISTS "productos_user_isolation"         ON productos;
DROP POLICY IF EXISTS "compras_inventario_user_isolation" ON compras_inventario;

-- Crear políticas nuevas basadas en negocio_id
CREATE POLICY "clientes_negocio_isolation" ON clientes
  FOR ALL TO authenticated
  USING    (negocio_id = get_negocio_id_for_user())
  WITH CHECK (negocio_id = get_negocio_id_for_user());

CREATE POLICY "ventas_negocio_isolation" ON ventas
  FOR ALL TO authenticated
  USING    (negocio_id = get_negocio_id_for_user())
  WITH CHECK (negocio_id = get_negocio_id_for_user());

CREATE POLICY "cuotas_negocio_isolation" ON cuotas
  FOR ALL TO authenticated
  USING    (negocio_id = get_negocio_id_for_user())
  WITH CHECK (negocio_id = get_negocio_id_for_user());

CREATE POLICY "abonos_negocio_isolation" ON abonos
  FOR ALL TO authenticated
  USING    (negocio_id = get_negocio_id_for_user())
  WITH CHECK (negocio_id = get_negocio_id_for_user());

CREATE POLICY "movimientos_caja_negocio_isolation" ON movimientos_caja
  FOR ALL TO authenticated
  USING    (negocio_id = get_negocio_id_for_user())
  WITH CHECK (negocio_id = get_negocio_id_for_user());

CREATE POLICY "productos_negocio_isolation" ON productos
  FOR ALL TO authenticated
  USING    (negocio_id = get_negocio_id_for_user())
  WITH CHECK (negocio_id = get_negocio_id_for_user());

CREATE POLICY "compras_inventario_negocio_isolation" ON compras_inventario
  FOR ALL TO authenticated
  USING    (negocio_id = get_negocio_id_for_user())
  WITH CHECK (negocio_id = get_negocio_id_for_user());

-- ============================================================
-- RLS TABLAS NUEVAS
-- ============================================================

ALTER TABLE negocios     ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE invitaciones ENABLE ROW LEVEL SECURITY;

-- negocios: cualquier miembro puede leer su propio negocio
CREATE POLICY "negocios_read_own" ON negocios
  FOR SELECT TO authenticated
  USING (id = get_negocio_id_for_user());

-- negocios: solo UPDATE (renombrar) — INSERT lo hace el service, no RLS
CREATE POLICY "negocios_update_own" ON negocios
  FOR UPDATE TO authenticated
  USING    (id = get_negocio_id_for_user())
  WITH CHECK (id = get_negocio_id_for_user());

-- profiles: leer los miembros del mismo negocio
CREATE POLICY "profiles_read_same_negocio" ON profiles
  FOR SELECT TO authenticated
  USING (negocio_id = get_negocio_id_for_user());

-- profiles: cada usuario puede insertar su propio profile (join flow)
CREATE POLICY "profiles_insert_own" ON profiles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- invitaciones: miembros del negocio pueden CRUD sus invitaciones
CREATE POLICY "invitaciones_negocio_isolation" ON invitaciones
  FOR ALL TO authenticated
  USING    (negocio_id = get_negocio_id_for_user())
  WITH CHECK (negocio_id = get_negocio_id_for_user());

-- invitaciones: cualquier usuario autenticado puede leer por código
-- (necesario para el flow de unirse: el usuario aún no tiene profile)
CREATE POLICY "invitaciones_read_by_codigo" ON invitaciones
  FOR SELECT TO authenticated
  USING (true);

COMMIT;
