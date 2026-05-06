-- migrations/010_fix_profiles_rls.sql
-- ROLLBACK / FIX: restaurar policy profiles_read_same_negocio correcta
--
-- PROBLEMA: la versión anterior usaba subquery directa en el USING clause
-- lo que causa recursión infinita (policy → lee profiles → dispara policy → ...).
-- SOLUCIÓN: volver a la función SECURITY DEFINER que bypasea RLS internamente.
--
-- EJECUTAR EN SUPABASE DASHBOARD → SQL Editor → Run

-- 1. Droppear policy posiblemente rota
DROP POLICY IF EXISTS "profiles_read_same_negocio" ON profiles;

-- 2. Restaurar/recrear función SECURITY DEFINER (bypasea RLS, sin recursión)
CREATE OR REPLACE FUNCTION get_negocio_id_for_user()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT negocio_id FROM profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- 3. Policy usando la función — NO subquery directa (evita recursión)
CREATE POLICY "profiles_read_same_negocio" ON profiles
  FOR SELECT TO authenticated
  USING (negocio_id = get_negocio_id_for_user());
