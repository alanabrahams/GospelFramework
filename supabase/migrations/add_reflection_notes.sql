-- Add reflection_notes column to assessments table
-- Stores user's private journal notes as JSONB: { [subQuestionId]: string }

ALTER TABLE assessments
ADD COLUMN IF NOT EXISTS reflection_notes JSONB;

-- Add comment to document the structure
COMMENT ON COLUMN assessments.reflection_notes IS 'Stores reflection notes as JSONB object mapping sub-question IDs to user notes';

