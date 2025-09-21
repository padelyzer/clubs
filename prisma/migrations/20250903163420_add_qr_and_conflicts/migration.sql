-- AlterTable
ALTER TABLE "public"."TournamentMatch" ADD COLUMN     "actualEndTime" TIMESTAMP(3),
ADD COLUMN     "actualStartTime" TIMESTAMP(3),
ADD COLUMN     "conflictResolved" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "resultsConfirmed" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "public"."TournamentMatchResult" (
    "id" TEXT NOT NULL,
    "matchId" TEXT NOT NULL,
    "submittedBy" TEXT NOT NULL,
    "submitterPhone" TEXT,
    "submitterEmail" TEXT,
    "team1Sets" JSONB NOT NULL,
    "team2Sets" JSONB NOT NULL,
    "team1TotalSets" INTEGER NOT NULL,
    "team2TotalSets" INTEGER NOT NULL,
    "winner" TEXT NOT NULL,
    "duration" INTEGER,
    "confirmed" BOOLEAN NOT NULL DEFAULT false,
    "conflictStatus" TEXT,
    "conflictNotes" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),
    "confirmedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TournamentMatchResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CourtQRCode" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "courtId" TEXT NOT NULL,
    "courtNumber" TEXT NOT NULL,
    "qrCode" TEXT NOT NULL,
    "qrImageUrl" TEXT,
    "accessUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourtQRCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TournamentBlockedDate" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "courts" TEXT[],
    "blockType" TEXT NOT NULL DEFAULT 'tournament',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TournamentBlockedDate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TournamentMatchResult_matchId_idx" ON "public"."TournamentMatchResult"("matchId");

-- CreateIndex
CREATE INDEX "TournamentMatchResult_conflictStatus_idx" ON "public"."TournamentMatchResult"("conflictStatus");

-- CreateIndex
CREATE INDEX "TournamentMatchResult_submittedAt_idx" ON "public"."TournamentMatchResult"("submittedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CourtQRCode_courtId_key" ON "public"."CourtQRCode"("courtId");

-- CreateIndex
CREATE UNIQUE INDEX "CourtQRCode_qrCode_key" ON "public"."CourtQRCode"("qrCode");

-- CreateIndex
CREATE INDEX "CourtQRCode_qrCode_idx" ON "public"."CourtQRCode"("qrCode");

-- CreateIndex
CREATE INDEX "CourtQRCode_courtId_idx" ON "public"."CourtQRCode"("courtId");

-- CreateIndex
CREATE UNIQUE INDEX "CourtQRCode_clubId_courtId_key" ON "public"."CourtQRCode"("clubId", "courtId");

-- CreateIndex
CREATE INDEX "TournamentBlockedDate_tournamentId_idx" ON "public"."TournamentBlockedDate"("tournamentId");

-- CreateIndex
CREATE INDEX "TournamentBlockedDate_clubId_idx" ON "public"."TournamentBlockedDate"("clubId");

-- CreateIndex
CREATE INDEX "TournamentBlockedDate_date_idx" ON "public"."TournamentBlockedDate"("date");

-- AddForeignKey
ALTER TABLE "public"."TournamentMatchResult" ADD CONSTRAINT "TournamentMatchResult_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "public"."TournamentMatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourtQRCode" ADD CONSTRAINT "CourtQRCode_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "public"."Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CourtQRCode" ADD CONSTRAINT "CourtQRCode_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "public"."Court"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TournamentBlockedDate" ADD CONSTRAINT "TournamentBlockedDate_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "public"."Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TournamentBlockedDate" ADD CONSTRAINT "TournamentBlockedDate_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "public"."Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
