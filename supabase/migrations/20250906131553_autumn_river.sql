/*
  # Fix chat sessions user_id type

  1. Changes
    - Change user_id from uuid to text to accept email addresses
    - Update foreign key constraint to reference profiles by email
    - Update RLS policies to work with email-based user_id

  2. Security
    - Maintain RLS policies for user data isolation
    - Update policies to use email comparison instead of UUID
*/

-- Drop existing foreign key constraint
ALTER TABLE chat_sessions DROP CONSTRAINT IF EXISTS chat_sessions_user_id_fkey;

-- Change user_id column type from uuid to text
ALTER TABLE chat_sessions ALTER COLUMN user_id TYPE text;

-- Update RLS policies to work with email-based user_id
DROP POLICY IF EXISTS "Users can manage own chat sessions" ON chat_sessions;

CREATE POLICY "Users can manage own chat sessions"
  ON chat_sessions
  FOR ALL
  TO authenticated
  USING (user_id = (auth.jwt() ->> 'email'))
  WITH CHECK (user_id = (auth.jwt() ->> 'email'));

-- Update chat_messages RLS policy to work with email-based sessions
DROP POLICY IF EXISTS "Users can manage own chat messages" ON chat_messages;

CREATE POLICY "Users can manage own chat messages"
  ON chat_messages
  FOR ALL
  TO authenticated
  USING (session_id IN (
    SELECT id FROM chat_sessions 
    WHERE user_id = (auth.jwt() ->> 'email')
  ))
  WITH CHECK (session_id IN (
    SELECT id FROM chat_sessions 
    WHERE user_id = (auth.jwt() ->> 'email')
  ));