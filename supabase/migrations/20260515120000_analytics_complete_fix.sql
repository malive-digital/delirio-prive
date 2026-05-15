-- ================================================================
-- CORREÇÃO COMPLETA: Profile Analytics
-- Execute este script inteiro no SQL Editor do Supabase.
-- Ele recria tudo do zero com a abordagem correta.
-- ================================================================

-- Passo 1: Garante que a tabela existe
CREATE TABLE IF NOT EXISTS public.profile_analytics (
  profile_id      uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  profile_views   bigint NOT NULL DEFAULT 0 CHECK (profile_views >= 0),
  whatsapp_clicks bigint NOT NULL DEFAULT 0 CHECK (whatsapp_clicks >= 0),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Passo 2: Habilita RLS
ALTER TABLE public.profile_analytics ENABLE ROW LEVEL SECURITY;

-- Passo 3: Remove todas as policies antigas para recriar limpas
DROP POLICY IF EXISTS "Users can read own profile analytics"         ON public.profile_analytics;
DROP POLICY IF EXISTS "Admins can read profile analytics"            ON public.profile_analytics;
DROP POLICY IF EXISTS "Service role can insert profile analytics"    ON public.profile_analytics;
DROP POLICY IF EXISTS "Service role can update profile analytics"    ON public.profile_analytics;
DROP POLICY IF EXISTS "Allow insert profile analytics"               ON public.profile_analytics;
DROP POLICY IF EXISTS "Allow update profile analytics"               ON public.profile_analytics;

-- Passo 4: Policy de leitura — dono do perfil vê seus próprios dados
-- NOTA: profile_id é o próprio UUID do usuário (não existe coluna user_id em profiles)
CREATE POLICY "Users can read own profile analytics"
ON public.profile_analytics FOR SELECT
TO authenticated
USING (profile_id = auth.uid());

-- Passo 5: Policy de leitura — admin vê tudo
CREATE POLICY "Admins can read profile analytics"
ON public.profile_analytics FOR SELECT
TO authenticated
USING (public.is_admin());

-- Passo 6: Policy de INSERT aberta (as funções SECURITY DEFINER
-- rodam como postgres/owner, mas em algumas configurações do Supabase
-- ainda precisam de uma policy explícita para o role chamador)
CREATE POLICY "Allow insert profile analytics"
ON public.profile_analytics FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Passo 7: Policy de UPDATE aberta
CREATE POLICY "Allow update profile analytics"
ON public.profile_analytics FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Passo 8: Recria increment_profile_view
-- MUDANÇA CHAVE: usa public.profiles diretamente (não a view published_profiles)
-- pois a view pode ter restrições adicionais que bloqueiam o EXISTS interno.
-- A verificação de perfil aprovado é feita direto na tabela profiles.
CREATE OR REPLACE FUNCTION public.increment_profile_view(target_profile_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF target_profile_id IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO public.profile_analytics (profile_id, profile_views, updated_at)
  SELECT target_profile_id, 1, now()
  WHERE EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = target_profile_id
      AND profiles.profile_approval_status = 'approved'
      AND profiles.is_online = true
  )
  ON CONFLICT (profile_id) DO UPDATE
  SET
    profile_views = public.profile_analytics.profile_views + 1,
    updated_at    = now();

EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'increment_profile_view error: %', SQLERRM;
END;
$$;

-- Passo 9: Recria increment_whatsapp_click
CREATE OR REPLACE FUNCTION public.increment_whatsapp_click(target_profile_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF target_profile_id IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO public.profile_analytics (profile_id, whatsapp_clicks, updated_at)
  SELECT target_profile_id, 1, now()
  WHERE EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE profiles.id = target_profile_id
      AND profiles.profile_approval_status = 'approved'
      AND profiles.is_online = true
      AND nullif(regexp_replace(coalesce(profiles.whatsapp, ''), '\D', '', 'g'), '') IS NOT NULL
  )
  ON CONFLICT (profile_id) DO UPDATE
  SET
    whatsapp_clicks = public.profile_analytics.whatsapp_clicks + 1,
    updated_at      = now();

EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'increment_whatsapp_click error: %', SQLERRM;
END;
$$;

-- Passo 10: Garante permissões de execução
GRANT SELECT ON public.profile_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION public.increment_profile_view(uuid)   TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_whatsapp_click(uuid) TO anon, authenticated;

-- ================================================================
-- TESTE: rode estas queries para verificar se funcionou.
-- Substitua 'SEU-PROFILE-UUID-AQUI' pelo UUID real de um perfil.
-- ================================================================
-- SELECT public.increment_profile_view('SEU-PROFILE-UUID-AQUI');
-- SELECT public.increment_whatsapp_click('SEU-PROFILE-UUID-AQUI');
-- SELECT * FROM public.profile_analytics;
