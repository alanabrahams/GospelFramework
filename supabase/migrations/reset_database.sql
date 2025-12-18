-- Reset Database Script
-- This script will drop and recreate the assessments table with all migrations applied
-- WARNING: This will delete ALL data in the assessments table

-- Drop the assessments table if it exists (this will also drop all indexes and policies)
DROP TABLE IF EXISTS assessments CASCADE;

-- Recreate assessments table for storing church health assessment submissions
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  church_name TEXT NOT NULL,
  total_score NUMERIC(5, 2) NOT NULL,
  scores_json JSONB NOT NULL,
  section_scores JSONB NOT NULL,
  status TEXT DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted')),
  reflection_notes JSONB
);

-- Create indexes
CREATE INDEX idx_assessments_created_at ON assessments(created_at DESC);
CREATE INDEX idx_assessments_user_email ON assessments(user_email);
CREATE INDEX idx_assessments_status ON assessments(status);

-- Enable Row Level Security (RLS)
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations with anon key (for this use case)
CREATE POLICY "Allow all operations for anon users" ON assessments
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Add comments
COMMENT ON COLUMN assessments.status IS 'Status of the assessment: draft (in progress) or submitted (complete)';
COMMENT ON COLUMN assessments.reflection_notes IS 'Stores reflection notes as JSONB object mapping sub-question IDs to user notes';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'Database reset complete. Assessments table has been recreated.';
END $$;

