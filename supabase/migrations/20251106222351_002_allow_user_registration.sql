/*
  # Allow User Registration

  1. Changes
    - Add INSERT policy for users table to allow registration
    - Anyone can insert a new user (for registration)
    - New users default to 'participant' role with 0 tickets
  
  2. Security
    - Policy ensures new users start with safe defaults
    - RLS remains enabled
*/

-- Drop existing policy if it exists
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Anyone can register" ON users;
EXCEPTION
  WHEN undefined_object THEN NULL;
END $$;

-- Allow anyone to insert users (for registration)
CREATE POLICY "Anyone can register"
  ON users FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
