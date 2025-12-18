-- Add status column to assessments table for draft/submitted tracking
ALTER TABLE assessments
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted'));

-- Create index on status for faster filtering
CREATE INDEX IF NOT EXISTS idx_assessments_status ON assessments(status);

-- Note: We'll use application logic to handle one draft per user
-- A unique constraint on (user_email, status) where status='draft' would be ideal
-- but PostgreSQL partial unique indexes require a different approach
-- For now, we'll handle uniqueness in application code

-- Add comment to document the status column
COMMENT ON COLUMN assessments.status IS 'Status of the assessment: draft (in progress) or submitted (complete)';

