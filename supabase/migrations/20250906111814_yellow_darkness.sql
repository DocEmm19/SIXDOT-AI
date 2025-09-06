/*
  # Create consultations table for AI interactions

  1. New Tables
    - `consultations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `question` (text)
      - `response` (text)
      - `type` (text) - 'question', 'upload', 'search'
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on `consultations` table
    - Add policies for authenticated users to manage their own consultations
*/

CREATE TABLE IF NOT EXISTS consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question text NOT NULL,
  response text NOT NULL,
  type text NOT NULL DEFAULT 'question',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;

-- Policy for users to read their own consultations
CREATE POLICY "Users can read own consultations"
  ON consultations
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy for users to insert their own consultations
CREATE POLICY "Users can insert own consultations"
  ON consultations
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to update their own consultations
CREATE POLICY "Users can update own consultations"
  ON consultations
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy for users to delete their own consultations
CREATE POLICY "Users can delete own consultations"
  ON consultations
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);