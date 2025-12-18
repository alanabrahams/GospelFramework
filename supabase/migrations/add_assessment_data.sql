-- Add assessment_data column to assessments table
-- Stores the full assessment responses as JSONB: { worship: { ... }, discipleship: { ... }, mission: { ... } }

ALTER TABLE assessments
ADD COLUMN IF NOT EXISTS assessment_data JSONB;

-- Add comment to document the structure
COMMENT ON COLUMN assessments.assessment_data IS 'Stores full assessment responses as JSONB matching AssessmentResponse schema';

