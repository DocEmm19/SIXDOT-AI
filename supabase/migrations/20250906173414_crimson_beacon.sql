/*
  # Fix Chat Sessions RLS Policies

  1. Security
    - Add missing RLS policies for chat_sessions table
    - Allow authenticated users to insert their own chat sessions
    - Ensure proper user_id validation

  2. Changes
    - Add INSERT policy for authenticated users
    - Verify existing policies are working correctly
*/

-- Ensure RLS is enabled on chat_sessions table
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to recreate them properly
DROP POLICY IF EXISTS "Users can manage own chat sessions" ON chat_sessions;

-- Create comprehensive policies for chat_sessions
CREATE POLICY "Users can insert own chat sessions"
  ON chat_sessions
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can select own chat sessions"
  ON chat_sessions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own chat sessions"
  ON chat_sessions
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own chat sessions"
  ON chat_sessions
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());