-- AlterTable
ALTER TABLE "public"."Booking" ADD COLUMN "playerId" TEXT;

-- CreateIndex
CREATE INDEX "Booking_playerId_idx" ON "public"."Booking"("playerId");

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "public"."Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;