-- Assembler Status FSM Migration
-- Creates ENUM type and updates assemblers table with proper status field

-- 1. Create the assembler_status ENUM type
CREATE TYPE assembler_status AS ENUM (
  'AVAILABLE',
  'ASSIGNED',
  'EN_ROUTE',
  'WORKING'
);

-- 2. Add status column to assemblers table (if not exists)
-- First check if column exists, if it does, we'll alter its type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'assemblers' AND column_name = 'status'
  ) THEN
    -- Column doesn't exist, create it
    ALTER TABLE assemblers
    ADD COLUMN status assembler_status NOT NULL DEFAULT 'AVAILABLE';
  ELSE
    -- Column exists but might be VARCHAR, convert it
    -- This assumes existing values are compatible
    ALTER TABLE assemblers
    ALTER COLUMN status TYPE assembler_status USING status::assembler_status;
    
    ALTER TABLE assemblers
    ALTER COLUMN status SET DEFAULT 'AVAILABLE';
    
    ALTER TABLE assemblers
    ALTER COLUMN status SET NOT NULL;
  END IF;
END $$;

-- 4. Create index on status for faster queries
CREATE INDEX IF NOT EXISTS idx_assemblers_status ON assemblers(status);

-- 5. Update any existing data to ensure consistency
-- Set all assemblers without active tasks to AVAILABLE
UPDATE assemblers
SET status = 'AVAILABLE'
WHERE active_task_uuid IS NULL AND status <> 'AVAILABLE';

-- 6. Add comment for documentation
COMMENT ON COLUMN assemblers.status IS 'Assembler status following FSM: AVAILABLE → ASSIGNED → EN_ROUTE → WORKING → AVAILABLE';
