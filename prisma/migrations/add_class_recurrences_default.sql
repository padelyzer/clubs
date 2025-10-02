-- AlterTable: Add defaultClassRecurrences to ClubSettings
ALTER TABLE "ClubSettings" ADD COLUMN IF NOT EXISTS "defaultClassRecurrences" INTEGER NOT NULL DEFAULT 12;