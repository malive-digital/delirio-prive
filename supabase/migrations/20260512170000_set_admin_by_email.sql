-- =============================================================
-- Define um usuário como ADMINISTRADOR pelo e-mail
-- Substitua o valor abaixo pelo e-mail desejado antes de rodar
-- =============================================================

DO $$
DECLARE
  v_email  TEXT := 'SEU_EMAIL_AQUI@dominio.com'; -- << ALTERE AQUI
  v_uid    UUID;
BEGIN
  -- 1. Busca o UUID do usuário pelo e-mail no Supabase Auth
  SELECT id INTO v_uid
  FROM auth.users
  WHERE email = v_email
  LIMIT 1;

  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Usuário com e-mail "%" não encontrado em auth.users. Crie a conta primeiro.', v_email;
  END IF;

  -- 2. Insere (ou atualiza) na tabela admin_users
  INSERT INTO public.admin_users (user_id, email, role)
  VALUES (v_uid, v_email, 'admin')
  ON CONFLICT (user_id) DO UPDATE
    SET email = v_email,
        role  = 'admin';

  -- 3. Insere (ou atualiza) na tabela user_roles
  INSERT INTO public.user_roles (user_id, role, updated_at)
  VALUES (v_uid, 'admin', now())
  ON CONFLICT (user_id) DO UPDATE
    SET role       = 'admin',
        updated_at = now();

  RAISE NOTICE 'Usuário "%" (%) designado como ADMIN com sucesso.', v_email, v_uid;
END;
$$;
