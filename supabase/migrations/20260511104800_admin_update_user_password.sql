-- Create a secure function that allows admins to update any user's password
CREATE OR REPLACE FUNCTION admin_update_user_password(
  target_user_id UUID,
  new_password TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin BOOLEAN;
  caller_email TEXT;
BEGIN
  -- Check if the caller is an admin via tables
  SELECT EXISTS (
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  ) OR EXISTS (
    SELECT 1 FROM admin_users WHERE user_id = auth.uid()
  ) INTO is_admin;

  caller_email := auth.jwt() ->> 'email';

  IF NOT is_admin AND caller_email != 'admin@delirioprive.com' THEN
    RAISE EXCEPTION 'Acesso negado: apenas administradores podem alterar senhas.';
  END IF;

  -- Update the password in auth.users
  UPDATE auth.users
  SET 
    encrypted_password = crypt(new_password, gen_salt('bf')),
    updated_at = now()
  WHERE id = target_user_id;
END;
$$;
