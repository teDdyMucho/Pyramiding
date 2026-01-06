# Database Setup Instructions

## Database Column Names

**Important**: The database uses the following column names:
- `myreferralcode` - User's unique referral code (previously `referral_code`)
- `whoinvite` - The referral code used to invite this user (previously `invite_code`)

## Unique Referral Code Generation

The `register_user` function has been updated to ensure that every user gets a **unique referral code** during registration.

### How It Works

1. **Random Code Generation**: Generates a 10-character alphanumeric code using `gen_random_bytes()`
2. **Uniqueness Check**: Checks if the generated code already exists in the database
3. **Retry Logic**: If the code exists, it generates a new one (up to 10 attempts)
4. **Guaranteed Uniqueness**: The function will not proceed until a unique code is found

### Implementation Steps

Run the following SQL in your Supabase SQL Editor:

```sql
-- See register_user_function.sql for the complete function
-- See verify_login_function.sql for the login function
```

### Key Features

- **Automatic Retry**: If a collision occurs, the function automatically generates a new code
- **URL-Safe Characters**: Replaces `+`, `/`, and `=` with safe alternatives
- **Error Handling**: Raises an exception if unable to generate a unique code after 10 attempts
- **Atomic Operation**: The entire registration is wrapped in a transaction

### Database Schema Requirements

Ensure your `users` table has:
- `myreferralcode` column with a **UNIQUE constraint**
- `whoinvite` column to track who invited the user
- Index on `myreferralcode` for fast lookups

```sql
-- Add unique constraint if not exists
ALTER TABLE users ADD CONSTRAINT users_myreferralcode_key UNIQUE (myreferralcode);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_users_myreferralcode ON users(myreferralcode);
CREATE INDEX IF NOT EXISTS idx_users_whoinvite ON users(whoinvite);
```

### Testing

To verify uniqueness:

```sql
-- Check for duplicate referral codes
SELECT myreferralcode, COUNT(*) 
FROM users 
GROUP BY myreferralcode 
HAVING COUNT(*) > 1;
```

This should return no rows if all referral codes are unique.

### Points Ledger Integration

The function also creates an initial entry in the `points_ledger` table with:
- User's ID
- Initial points: 0
- Initial goals: goal1=0, goal2=0, goal3=0
- Referral code copied from the user record (stored in `refferal` column)
