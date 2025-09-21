-- CreateTable
CREATE TABLE "public"."Player" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "birthDate" TIMESTAMP(3),
    "level" TEXT,
    "preferredPosition" TEXT,
    "notes" TEXT,
    "avatar" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "memberNumber" TEXT,
    "memberSince" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "totalBookings" INTEGER NOT NULL DEFAULT 0,
    "totalSpent" INTEGER NOT NULL DEFAULT 0,
    "lastBookingAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Player_clubId_idx" ON "public"."Player"("clubId");

-- CreateIndex
CREATE INDEX "Player_phone_idx" ON "public"."Player"("phone");

-- CreateIndex
CREATE INDEX "Player_email_idx" ON "public"."Player"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Player_clubId_phone_key" ON "public"."Player"("clubId", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "Player_clubId_memberNumber_key" ON "public"."Player"("clubId", "memberNumber");

-- AddForeignKey
ALTER TABLE "public"."Player" ADD CONSTRAINT "Player_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "public"."Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;