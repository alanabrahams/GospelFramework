-- Create assessments table for storing church health assessment submissions
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  church_name TEXT NOT NULL,
  total_score NUMERIC(5, 2) NOT NULL,
  scores_json JSONB NOT NULL,
  section_scores JSONB NOT NULL
);

-- Create index on created_at for faster sorting
CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON assessments(created_at DESC);

-- Create index on user_email for potential lookups
CREATE INDEX IF NOT EXISTS idx_assessments_user_email ON assessments(user_email);

-- Enable Row Level Security (RLS)
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations with anon key (for this use case)
-- In production, you may want to restrict this further
CREATE POLICY "Allow all operations for anon users" ON assessments
  FOR ALL
  USING (true)
  WITH CHECK (true);






