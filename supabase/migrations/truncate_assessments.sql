-- Truncate Assessments Table
-- This script will delete all data from the assessments table but keep the table structure
-- WARNING: This will delete ALL data in the assessments table

TRUNCATE TABLE assessments RESTART IDENTITY CASCADE;

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'All assessment data has been deleted. Table structure remains intact.';
END $$;

