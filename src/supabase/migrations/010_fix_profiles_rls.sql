-- migrations/010_fix_profiles_rls.sql
-- Fix: política RLS de profiles para lectura de miembros del negocio
-- El STABLE + SECURITY DEFINER en get_negocio_id_for_user puede tener
-- comportamiento de caché que oculta perfiles de otros miembros.
-- Se refuerza la política y se recrea la función con SET search_path.
--
-- EJECUTAR EN SUPABASE DASHBOARD → SQL Editor → Run

-- 1. Recrear función con search_path explícito (previene issues de esquema)
CREATE OR REPLACE FUNCTION get_negocio_id_for_user()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT negocio_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1;
$$;

-- 2. Droppear política existente y recrear con lógica robusta
DROP POLICY IF EXISTS "profiles_read_same_negocio" ON profiles;

CREATE POLICY "profiles_read_same_negocio" ON profiles
  FOR SELECT TO authenticated
  USING (
    negocio_id = (
      SELECT p.negocio_id
      FROM public.profiles p
      WHERE p.user_id = auth.uid()
      LIMIT 1
    )
  );
