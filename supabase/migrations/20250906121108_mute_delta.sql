/*
  # Create UserActivity table for storing extracted text

  1. New Tables
    - `UserActivity`
      - `id` (uuid, primary key)
      - `user_email` (text, references user)
      - `extracted_text` (text, stores the extracted content)
      - `analysis_result` (text, unlimited length field for analysis data)
      - `file_name` (text, original file name)
      - `file_type` (text, file type/format)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `UserActivity` table
    - Add policy for users to read/write their own activity data
*/

CREATE TABLE IF NOT EXISTS UserActivity (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_email text NOT NULL,
  extracted_text text NOT NULL,
  analysis_result text DEFAULT '',
  file_name text,
  file_type text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE UserActivity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own activity data"
  ON UserActivity
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can insert own activity data"
  ON UserActivity
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.jwt() ->> 'email' = user_email);

CREATE POLICY "Users can update own activity data"
  ON UserActivity
  FOR UPDATE
  TO authenticated
  USING (auth.jwt() ->> 'email' = user_email)
  WITH CHECK (auth.jwt() ->> 'email' = user_email);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_user_activity_user_email ON UserActivity(user_email);
CREATE INDEX IF NOT EXISTS idx_user_activity_created_at ON UserActivity(created_at DESC);

-- Function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_user_activity_updated_at
  BEFORE UPDATE ON UserActivity
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();