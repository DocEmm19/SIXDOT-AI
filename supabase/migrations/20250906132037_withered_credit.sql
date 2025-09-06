/*
  # Revert chat_sessions to use UUID for user_id

  1. Changes
    - Change user_id column back to uuid type
    - Add foreign key constraint to profiles table
    - Update RLS policies to use proper UUID matching

  2. Security
    - Enable RLS on chat_sessions table
    - Add policies for authenticated users to manage their own sessions
*/

-- First, clear any existing data that might have invalid UUIDs
DELETE FROM chat_messages;
DELETE FROM chat_sessions;

-- Change user_id back to uuid type
ALTER TABLE chat_sessions 
ALTER COLUMN user_id TYPE uuid USING user_id::uuid;

-- Add foreign key constraint to profiles table
ALTER TABLE chat_sessions 
ADD CONSTRAINT chat_sessions_user_id_fkey 
FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;

-- Update RLS policies to use proper UUID matching
DROP POLICY IF EXISTS "Users can manage own chat sessions" ON chat_sessions;

CREATE POLICY "Users can manage own chat sessions"
  ON chat_sessions
  FOR ALL
  TO authenticated
  USING (user_id = (SELECT profiles.id FROM profiles WHERE profiles.id = auth.uid()))
  WITH CHECK (user_id = (SELECT profiles.id FROM profiles WHERE profiles.id = auth.uid()));

-- Update chat_messages RLS policy as well
DROP POLICY IF EXISTS "Users can manage own chat messages" ON chat_messages;

CREATE POLICY "Users can manage own chat messages"
  ON chat_messages
  FOR ALL
  TO authenticated
  USING (session_id IN (
    SELECT chat_sessions.id 
    FROM chat_sessions 
    WHERE chat_sessions.user_id = (
      SELECT profiles.id 
      FROM profiles 
      WHERE profiles.id = auth.uid()
    )
  ))
  WITH CHECK (session_id IN (
    SELECT chat_sessions.id 
    FROM chat_sessions 
    WHERE chat_sessions.user_id = (
      SELECT profiles.id 
      FROM profiles 
      WHERE profiles.id = auth.uid()
    )
  ));