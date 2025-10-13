-- Add missing Player columns for class tracking
-- Migration: add_player_class_fields

-- Add totalClasses column (should not fail if exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='Player' AND column_name='totalClasses') THEN
        ALTER TABLE "Player" ADD COLUMN "totalClasses" INTEGER NOT NULL DEFAULT 0;
    END IF;
END $$;

-- Add lastClassAt column (should not fail if exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns
                   WHERE table_name='Player' AND column_name='lastClassAt') THEN
        ALTER TABLE "Player" ADD COLUMN "lastClassAt" TIMESTAMP(3);
    END IF;
END $$;
