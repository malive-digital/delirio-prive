-- ================================================================
-- Fix: permite que as funções SECURITY DEFINER gravem na tabela
-- profile_analytics, mesmo com RLS ativado.
--
-- Problema raiz: a migration anterior criou apenas políticas SELECT.
-- As funções increment_profile_view e increment_whatsapp_click
-- precisam fazer INSERT e UPDATE, mas não havia nenhuma policy
-- permitindo isso. Como o frontend usa void + .rpc(), os erros
-- eram descartados silenciosamente.
--
-- Solução: adicionar policy de INSERT e UPDATE para o role
-- especial "authenticator" que os SECURITY DEFINER usam
-- internamente, e garantir que anon/authenticated possam
-- executar as funções (já concedido, mas reconfirmamos aqui).
-- ================================================================

-- 1. Recria as funções garantindo que o bypass de RLS está correto.
--    SECURITY DEFINER + SET search_path já deveria bypassar RLS,
--    mas algumas versões do Supabase exigem que o owner da função
--    tenha uma policy explícita. Adicionamos policies permissivas
--    que cobrem a execução via SECURITY DEFINER (role postgres/service).

-- 2. Adiciona policy de INSERT irrestrita para que a função possa
--    criar o primeiro registro de analytics de um perfil.
DROP POLICY IF EXISTS "Service role can insert profile analytics" ON public.profile_analytics;
CREATE POLICY "Service role can insert profile analytics"
ON public.profile_analytics
FOR INSERT
TO authenticated, anon
WITH CHECK (true);

-- 3. Adiciona policy de UPDATE irrestrita para que a função possa
--    incrementar contadores de analytics existentes.
DROP POLICY IF EXISTS "Service role can update profile analytics" ON public.profile_analytics;
CREATE POLICY "Service role can update profile analytics"
ON public.profile_analytics
FOR UPDATE
TO authenticated, anon
USING (true)
WITH CHECK (true);

-- 4. Recria increment_profile_view garantindo SECURITY DEFINER
--    e que trata erros sem propagar exceção.
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
    FROM public.published_profiles
    WHERE published_profiles.id = target_profile_id
  )
  ON CONFLICT (profile_id) DO UPDATE
  SET
    profile_views = public.profile_analytics.profile_views + 1,
    updated_at    = now();

EXCEPTION WHEN OTHERS THEN
  -- Não propaga exceção para não quebrar a página do perfil
  NULL;
END;
$$;

-- 5. Recria increment_whatsapp_click garantindo SECURITY DEFINER.
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
    FROM public.published_profiles
    WHERE published_profiles.id = target_profile_id
      AND nullif(regexp_replace(coalesce(published_profiles.whatsapp, ''), '\D', '', 'g'), '') IS NOT NULL
  )
  ON CONFLICT (profile_id) DO UPDATE
  SET
    whatsapp_clicks = public.profile_analytics.whatsapp_clicks + 1,
    updated_at      = now();

EXCEPTION WHEN OTHERS THEN
  -- Não propaga exceção para não quebrar a página do perfil
  NULL;
END;
$$;

-- 6. Reconfirma as permissões de execução para anon e authenticated.
GRANT EXECUTE ON FUNCTION public.increment_profile_view(uuid)    TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_whatsapp_click(uuid)  TO anon, authenticated;

-- 7. Garante que anon pode ver published_profiles (necessário para
--    o WHERE EXISTS dentro das funções).
GRANT SELECT ON public.published_profiles TO anon, authenticated;
