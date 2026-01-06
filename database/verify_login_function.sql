-- Function to verify user login credentials
-- This function checks phone number and password, returns user data if valid

CREATE OR REPLACE FUNCTION verify_login(
  p_phone_number TEXT,
  p_password TEXT
)
RETURNS TABLE(
  id UUID,
  first_name TEXT,
  last_name TEXT,
  phone_number TEXT,
  role TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Query the users table to find matching phone number and password
  RETURN QUERY
  SELECT 
    u.id::UUID,
    u.first_name::TEXT,
    u.last_name::TEXT,
    u.phone_number::TEXT,
    u.role::TEXT
  FROM users u
  WHERE u.phone_number = p_phone_number
    AND u.password = crypt(p_password, u.password);
    
  -- If no rows returned, login failed
  -- The application will check if data is null/empty
END;
$$;

-- Grant execute permission to authenticated and anonymous users
GRANT EXECUTE ON FUNCTION verify_login(TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION verify_login(TEXT, TEXT) TO anon;
