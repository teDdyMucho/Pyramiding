-- Trigger function to automatically encrypt password on user creation
-- This function checks if password is null and password_plain exists,
-- then encrypts password_plain into the password column using bcrypt

CREATE OR REPLACE FUNCTION encrypt_password_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if password is null and password_plain has a value
  IF NEW.password IS NULL AND NEW.password_plain IS NOT NULL THEN
    -- Encrypt the plain password using bcrypt and store in password column
    NEW.password := crypt(NEW.password_plain, gen_salt('bf'));
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger that fires before insert on users table
DROP TRIGGER IF EXISTS trigger_encrypt_password_on_insert ON users;

CREATE TRIGGER trigger_encrypt_password_on_insert
  BEFORE INSERT ON users
  FOR EACH ROW
  EXECUTE FUNCTION encrypt_password_on_insert();

-- Note: Make sure the pgcrypto extension is enabled
-- Run this if not already enabled:
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;
