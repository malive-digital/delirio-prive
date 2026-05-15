-- ================================================================
-- Remove a condição is_online = true das funções de analytics.
-- Agora qualquer perfil aprovado (mesmo offline) terá suas
-- visualizações e cliques registrados.
-- ================================================================

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
  )
  ON CONFLICT (profile_id) DO UPDATE
  SET
    profile_views = public.profile_analytics.profile_views + 1,
    updated_at    = now();

EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'increment_profile_view error: %', SQLERRM;
END;
$$;

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

GRANT EXECUTE ON FUNCTION public.increment_profile_view(uuid)   TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_whatsapp_click(uuid) TO anon, authenticated;
