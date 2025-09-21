-- Add missing fields to TournamentRegistration for Stripe payments
ALTER TABLE "TournamentRegistration" 
ADD COLUMN IF NOT EXISTS "stripePaymentIntentId" TEXT,
ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT DEFAULT 'ONSITE',
ADD COLUMN IF NOT EXISTS "paymentReference" TEXT,
ADD COLUMN IF NOT EXISTS "paidAt" TIMESTAMP(3);

-- Add tournament payment tracking table
CREATE TABLE IF NOT EXISTS "TournamentPayment" (
  "id" TEXT NOT NULL,
  "tournamentId" TEXT NOT NULL,
  "registrationId" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'MXN',
  "method" TEXT NOT NULL DEFAULT 'ONSITE',
  "status" TEXT NOT NULL DEFAULT 'pending',
  "stripePaymentIntentId" TEXT,
  "stripeChargeId" TEXT,
  "stripeApplicationFee" INTEGER,
  "stripeTransferId" TEXT,
  "reference" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "completedAt" TIMESTAMP(3),
  
  CONSTRAINT "TournamentPayment_pkey" PRIMARY KEY ("id")
);

-- Add indexes
CREATE INDEX IF NOT EXISTS "TournamentPayment_tournamentId_idx" ON "TournamentPayment"("tournamentId");
CREATE INDEX IF NOT EXISTS "TournamentPayment_registrationId_idx" ON "TournamentPayment"("registrationId");
CREATE INDEX IF NOT EXISTS "TournamentPayment_status_idx" ON "TournamentPayment"("status");

-- Add foreign keys
ALTER TABLE "TournamentPayment" 
ADD CONSTRAINT "TournamentPayment_tournamentId_fkey" 
FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "TournamentPayment" 
ADD CONSTRAINT "TournamentPayment_registrationId_fkey" 
FOREIGN KEY ("registrationId") REFERENCES "TournamentRegistration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Add slug field to Tournament for public URLs
ALTER TABLE "Tournament" 
ADD COLUMN IF NOT EXISTS "slug" TEXT,
ADD COLUMN IF NOT EXISTS "currency" TEXT DEFAULT 'MXN',
ADD COLUMN IF NOT EXISTS "location" TEXT,
ADD COLUMN IF NOT EXISTS "registrationDeadline" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "goldenPoint" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "advantage" BOOLEAN DEFAULT true;

-- Create unique index for slug
CREATE UNIQUE INDEX IF NOT EXISTS "Tournament_slug_key" ON "Tournament"("slug");

-- Add score details to TournamentMatch
ALTER TABLE "TournamentMatch"
ADD COLUMN IF NOT EXISTS "goldenPointUsed" BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS "tiebreakScores" JSONB DEFAULT '[]';

-- Add partnerId to link team members in registrations
ALTER TABLE "TournamentRegistration"
ADD COLUMN IF NOT EXISTS "partnerId" TEXT,
ADD COLUMN IF NOT EXISTS "teamName" TEXT;