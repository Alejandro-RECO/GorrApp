-- migrations/008_fix_rls_negocios.sql
-- Fix: agregar INSERT policy a tabla negocios
-- La migration 007 omitió la policy de INSERT, causando error 42501
-- al intentar crear un negocio nuevo (crearNegocioYPerfil)
--
-- EJECUTAR EN SUPABASE DASHBOARD → SQL Editor → Run

-- Permitir a cualquier usuario autenticado crear un negocio
-- (necesario para el flujo de primer login, cuando aún no hay profile)
CREATE POLICY "negocios_insert_authenticated" ON negocios
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- También permitir INSERT en profiles (para el flujo de unirse)
-- La policy existente profiles_insert_own solo tiene WITH CHECK, no USING
-- Verificar que existe, si no crearla:
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles' AND policyname = 'profiles_insert_own'
  ) THEN
    CREATE POLICY "profiles_insert_own" ON profiles
      FOR INSERT TO authenticated
      WITH CHECK (user_id = auth.uid());
  END IF;
END $$;
