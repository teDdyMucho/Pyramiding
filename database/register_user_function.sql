-- Function to register a new user with unique referral code generation
-- This function ensures that each user gets a unique referral_code

CREATE OR REPLACE FUNCTION register_user(
  p_first_name TEXT,
  p_last_name TEXT,
  p_phone_number TEXT,
  p_password TEXT,
  p_invite_code TEXT
)
RETURNS TABLE(
  id UUID,
  first_name TEXT,
  last_name TEXT,
  phone_number TEXT,
  role TEXT,
  referral_code TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID;
  v_referral_code TEXT;
  v_role TEXT := 'users';
  v_max_attempts INT := 10;
  v_attempt INT := 0;
  v_exists BOOLEAN;
BEGIN
  -- Validate invite code exists (if provided)
  IF p_invite_code IS NOT NULL AND p_invite_code != '' THEN
    IF NOT EXISTS (SELECT 1 FROM users WHERE referral_code = p_invite_code) THEN
      RAISE EXCEPTION 'Invalid invite code';
    END IF;
    
    -- Check if the referral code owner has reached goal1 limit of 10 in points_ledger
    DECLARE
      v_goal1_value INT;
    BEGIN
      SELECT goal1 INTO v_goal1_value
      FROM points_ledger
      WHERE refferal = p_invite_code;
      
      IF v_goal1_value IS NOT NULL AND v_goal1_value >= 10 THEN
        RAISE EXCEPTION 'This referral code has exceeded the limit. Please contact your team leader for assistance.';
      END IF;
    END;
  END IF;

  -- Check for duplicate phone number
  IF EXISTS (SELECT 1 FROM users WHERE phone_number = p_phone_number) THEN
    RAISE EXCEPTION 'Phone number already registered' USING ERRCODE = '23505';
  END IF;

  -- Generate unique referral code with retry logic
  LOOP
    v_attempt := v_attempt + 1;
    
    -- Generate a random 10-character alphanumeric code
    v_referral_code := SUBSTRING(
      encode(gen_random_bytes(8), 'base64')
      FROM 1 FOR 10
    );
    
    -- Replace URL-unsafe characters
    v_referral_code := REPLACE(REPLACE(REPLACE(v_referral_code, '+', 'x'), '/', 'y'), '=', 'z');
    
    -- Check if this code already exists
    SELECT EXISTS (
      SELECT 1 FROM users WHERE referral_code = v_referral_code
    ) INTO v_exists;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT v_exists;
    
    -- Prevent infinite loop
    IF v_attempt >= v_max_attempts THEN
      RAISE EXCEPTION 'Failed to generate unique referral code after % attempts', v_max_attempts;
    END IF;
  END LOOP;

  -- Insert new user
  INSERT INTO users (
    first_name,
    last_name,
    phone_number,
    password,
    role,
    invite_code,
    referral_code,
    created_at
  ) VALUES (
    p_first_name,
    p_last_name,
    p_phone_number,
    crypt(p_password, gen_salt('bf')),
    v_role,
    p_invite_code,
    v_referral_code,
    NOW()
  )
  RETURNING users.id INTO v_user_id;

  -- Create initial points ledger entry
  INSERT INTO points_ledger (
    id,
    points,
    goal1,
    goal2,
    goal3,
    refferal,
    created_at
  ) VALUES (
    v_user_id,
    0,
    0,
    0,
    0,
    v_referral_code,
    NOW()
  );

  -- Return user data
  RETURN QUERY
  SELECT 
    users.id,
    users.first_name,
    users.last_name,
    users.phone_number,
    users.role,
    users.referral_code
  FROM users
  WHERE users.id = v_user_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION register_user(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION register_user(TEXT, TEXT, TEXT, TEXT, TEXT) TO anon;
