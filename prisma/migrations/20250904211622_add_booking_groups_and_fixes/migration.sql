-- AlterTable
ALTER TABLE "public"."Booking" ADD COLUMN     "bookingGroupId" TEXT;

-- AlterTable
ALTER TABLE "public"."ClubSettings" ADD COLUMN     "operatingHours" JSONB,
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'America/Mexico_City',
ALTER COLUMN "currency" SET DEFAULT 'MXN',
ALTER COLUMN "taxRate" SET DEFAULT 16;

-- AlterTable
ALTER TABLE "public"."Payment" ADD COLUMN     "bookingGroupId" TEXT,
ALTER COLUMN "bookingId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."SplitPayment" ADD COLUMN     "bookingGroupId" TEXT,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ALTER COLUMN "bookingId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Transaction" ADD COLUMN     "metadata" JSONB;

-- CreateTable
CREATE TABLE "public"."BookingGroup" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "playerName" TEXT NOT NULL,
    "playerEmail" TEXT,
    "playerPhone" TEXT NOT NULL,
    "totalPlayers" INTEGER NOT NULL DEFAULT 4,
    "price" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MXN',
    "status" "public"."BookingStatus" NOT NULL DEFAULT 'PENDING',
    "splitPaymentEnabled" BOOLEAN NOT NULL DEFAULT false,
    "splitPaymentCount" INTEGER NOT NULL DEFAULT 4,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "BookingGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BookingGroup_clubId_date_idx" ON "public"."BookingGroup"("clubId", "date");

-- CreateIndex
CREATE INDEX "BookingGroup_playerPhone_idx" ON "public"."BookingGroup"("playerPhone");

-- CreateIndex
CREATE INDEX "BookingGroup_status_idx" ON "public"."BookingGroup"("status");

-- CreateIndex
CREATE INDEX "Booking_bookingGroupId_idx" ON "public"."Booking"("bookingGroupId");

-- CreateIndex
CREATE INDEX "Payment_bookingGroupId_idx" ON "public"."Payment"("bookingGroupId");

-- CreateIndex
CREATE INDEX "SplitPayment_bookingGroupId_idx" ON "public"."SplitPayment"("bookingGroupId");

-- AddForeignKey
ALTER TABLE "public"."Booking" ADD CONSTRAINT "Booking_bookingGroupId_fkey" FOREIGN KEY ("bookingGroupId") REFERENCES "public"."BookingGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BookingGroup" ADD CONSTRAINT "BookingGroup_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "public"."Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payment" ADD CONSTRAINT "Payment_bookingGroupId_fkey" FOREIGN KEY ("bookingGroupId") REFERENCES "public"."BookingGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SplitPayment" ADD CONSTRAINT "SplitPayment_bookingGroupId_fkey" FOREIGN KEY ("bookingGroupId") REFERENCES "public"."BookingGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;
