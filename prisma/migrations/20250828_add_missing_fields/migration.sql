-- Add missing whatsappNumber column to Club table
ALTER TABLE "Club" ADD COLUMN IF NOT EXISTS "whatsappNumber" TEXT;

-- Add missing gender column to Player table
ALTER TABLE "Player" ADD COLUMN IF NOT EXISTS "gender" TEXT;

-- Create Tournament table if not exists
CREATE TABLE IF NOT EXISTS "Tournament" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'SINGLE_ELIMINATION',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "category" TEXT,
    "categories" JSONB,
    "registrationStart" TIMESTAMP(3) NOT NULL,
    "registrationEnd" TIMESTAMP(3) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "maxPlayers" INTEGER NOT NULL DEFAULT 16,
    "registrationFee" INTEGER NOT NULL DEFAULT 0,
    "prizePool" INTEGER NOT NULL DEFAULT 0,
    "currency" TEXT NOT NULL DEFAULT 'MXN',
    "matchDuration" INTEGER NOT NULL DEFAULT 90,
    "sets" INTEGER NOT NULL DEFAULT 3,
    "games" INTEGER NOT NULL DEFAULT 6,
    "tiebreak" BOOLEAN NOT NULL DEFAULT true,
    "rules" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);

-- Create TournamentRegistration table if not exists
CREATE TABLE IF NOT EXISTS "TournamentRegistration" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "player1Id" TEXT NOT NULL,
    "player1Name" TEXT NOT NULL,
    "player1Email" TEXT,
    "player1Phone" TEXT NOT NULL,
    "player1Level" TEXT,
    "player2Id" TEXT,
    "player2Name" TEXT,
    "player2Email" TEXT,
    "player2Phone" TEXT,
    "player2Level" TEXT,
    "teamLevel" TEXT,
    "modality" TEXT,
    "category" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "paidAmount" INTEGER NOT NULL DEFAULT 0,
    "paymentMethod" TEXT,
    "paymentReference" TEXT,
    "paymentDate" TIMESTAMP(3),
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "checkedIn" BOOLEAN NOT NULL DEFAULT false,
    "checkedInAt" TIMESTAMP(3),
    "teamName" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TournamentRegistration_pkey" PRIMARY KEY ("id")
);

-- Create TournamentRound table if not exists
CREATE TABLE IF NOT EXISTS "TournamentRound" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "stageLabel" TEXT NOT NULL,
    "modality" TEXT NOT NULL,
    "category" TEXT,
    "division" TEXT,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "matchesCount" INTEGER NOT NULL DEFAULT 0,
    "completedMatches" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TournamentRound_pkey" PRIMARY KEY ("id")
);

-- Create TournamentRoundCourt table if not exists
CREATE TABLE IF NOT EXISTS "TournamentRoundCourt" (
    "id" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "courtId" TEXT NOT NULL,
    "courtName" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "TournamentRoundCourt_pkey" PRIMARY KEY ("id")
);

-- Create TournamentMatch table if not exists
CREATE TABLE IF NOT EXISTS "TournamentMatch" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "roundId" TEXT,
    "round" TEXT NOT NULL,
    "matchNumber" INTEGER NOT NULL,
    "team1Name" TEXT,
    "team1Player1" TEXT,
    "team1Player2" TEXT,
    "team2Name" TEXT,
    "team2Player1" TEXT,
    "team2Player2" TEXT,
    "player1Id" TEXT,
    "player1Name" TEXT,
    "player2Id" TEXT,
    "player2Name" TEXT,
    "courtId" TEXT,
    "scheduledAt" TIMESTAMP(3),
    "startTime" TEXT,
    "endTime" TEXT,
    "qrCode" TEXT,
    "qrCodeUrl" TEXT,
    "qrValidUntil" TIMESTAMP(3),
    "team1Sets" JSONB,
    "team2Sets" JSONB,
    "team1Score" INTEGER,
    "team2Score" INTEGER,
    "winner" TEXT,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "courtNumber" TEXT,
    "matchDate" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TournamentMatch_pkey" PRIMARY KEY ("id")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "Tournament_clubId_idx" ON "Tournament"("clubId");
CREATE INDEX IF NOT EXISTS "Tournament_status_idx" ON "Tournament"("status");
CREATE INDEX IF NOT EXISTS "TournamentRegistration_tournamentId_idx" ON "TournamentRegistration"("tournamentId");
CREATE INDEX IF NOT EXISTS "TournamentRegistration_player1Id_idx" ON "TournamentRegistration"("player1Id");
CREATE INDEX IF NOT EXISTS "TournamentRegistration_player2Id_idx" ON "TournamentRegistration"("player2Id");
CREATE INDEX IF NOT EXISTS "TournamentRound_tournamentId_idx" ON "TournamentRound"("tournamentId");
CREATE INDEX IF NOT EXISTS "TournamentRound_stage_idx" ON "TournamentRound"("stage");
CREATE INDEX IF NOT EXISTS "TournamentRound_status_idx" ON "TournamentRound"("status");
CREATE INDEX IF NOT EXISTS "TournamentRoundCourt_roundId_idx" ON "TournamentRoundCourt"("roundId");
CREATE INDEX IF NOT EXISTS "TournamentRoundCourt_courtId_idx" ON "TournamentRoundCourt"("courtId");
CREATE INDEX IF NOT EXISTS "TournamentMatch_tournamentId_idx" ON "TournamentMatch"("tournamentId");
CREATE INDEX IF NOT EXISTS "TournamentMatch_roundId_idx" ON "TournamentMatch"("roundId");
CREATE INDEX IF NOT EXISTS "TournamentMatch_courtId_idx" ON "TournamentMatch"("courtId");
CREATE INDEX IF NOT EXISTS "TournamentMatch_status_idx" ON "TournamentMatch"("status");

-- Add foreign key constraints if tables exist
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Club') THEN
        ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_clubId_fkey" 
            FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    ALTER TABLE "TournamentRegistration" ADD CONSTRAINT "TournamentRegistration_tournamentId_fkey" 
        FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    
    ALTER TABLE "TournamentRound" ADD CONSTRAINT "TournamentRound_tournamentId_fkey" 
        FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    
    ALTER TABLE "TournamentRoundCourt" ADD CONSTRAINT "TournamentRoundCourt_roundId_fkey" 
        FOREIGN KEY ("roundId") REFERENCES "TournamentRound"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    
    ALTER TABLE "TournamentMatch" ADD CONSTRAINT "TournamentMatch_tournamentId_fkey" 
        FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;
END $$;