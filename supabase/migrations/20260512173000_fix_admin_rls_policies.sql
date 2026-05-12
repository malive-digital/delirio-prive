-- ================================================================
-- Fix: garantir que todos os admins possam aceitar/recusar perfis
-- Problema: a policy RLS só verificava user_roles. Admins que foram
-- cadastrados apenas em admin_users não conseguiam fazer UPDATE.
-- ================================================================

-- 1. Sincroniza todos os registros de admin_users → user_roles
INSERT INTO public.user_roles (user_id, role, created_at, updated_at)
SELECT user_id, 'admin'::public.app_role, created_at, now()
FROM public.admin_users
ON CONFLICT (user_id) DO UPDATE
  SET role       = 'admin'::public.app_role,
      updated_at = now();

-- 2. Cria função auxiliar que verifica admin nas duas tabelas
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
      AND user_roles.role = 'admin'::public.app_role
  )
  OR EXISTS (
    SELECT 1 FROM public.admin_users
    WHERE admin_users.user_id = auth.uid()
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- 3. Recria a policy de perfis usando a nova função (cobre ambas as tabelas)
DROP POLICY IF EXISTS "Admins can manage profiles" ON public.profiles;

CREATE POLICY "Admins can manage profiles"
ON public.profiles
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 4. Recria a policy de storage de documentos usando a nova função
DROP POLICY IF EXISTS "Admins can read user documents" ON storage.objects;

CREATE POLICY "Admins can read user documents"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'user-documents'
  AND public.is_admin()
);

-- 5. Recria a policy de profile_media usando a nova função
DROP POLICY IF EXISTS "Admins can manage profile media" ON public.profile_media;

CREATE POLICY "Admins can manage profile media"
ON public.profile_media
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());
