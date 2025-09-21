-- CreateTable
CREATE TABLE "public"."UserNotificationPreferences" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "bookingConfirmations" BOOLEAN NOT NULL DEFAULT true,
    "paymentReminders" BOOLEAN NOT NULL DEFAULT true,
    "bookingReminders" BOOLEAN NOT NULL DEFAULT true,
    "promotionalMessages" BOOLEAN NOT NULL DEFAULT false,
    "generalUpdates" BOOLEAN NOT NULL DEFAULT false,
    "optInDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "optOutDate" TIMESTAMP(3),
    "source" TEXT NOT NULL DEFAULT 'website',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserNotificationPreferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserNotificationPreferences_userId_key" ON "public"."UserNotificationPreferences"("userId");

-- CreateIndex
CREATE INDEX "UserNotificationPreferences_phoneNumber_idx" ON "public"."UserNotificationPreferences"("phoneNumber");

-- CreateIndex
CREATE INDEX "UserNotificationPreferences_userId_idx" ON "public"."UserNotificationPreferences"("userId");

-- AddForeignKey
ALTER TABLE "public"."UserNotificationPreferences" ADD CONSTRAINT "UserNotificationPreferences_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
