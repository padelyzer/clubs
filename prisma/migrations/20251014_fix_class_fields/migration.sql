-- Add missing fields to Class table if they don't exist
DO $$ 
BEGIN
    -- Add courtCost if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'Class' AND column_name = 'courtCost') THEN
        ALTER TABLE "Class" ADD COLUMN "courtCost" INTEGER NOT NULL DEFAULT 0;
    END IF;

    -- Add instructorCost if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'Class' AND column_name = 'instructorCost') THEN
        ALTER TABLE "Class" ADD COLUMN "instructorCost" INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;
