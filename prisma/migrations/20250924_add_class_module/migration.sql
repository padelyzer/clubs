-- CreateEnum
CREATE TYPE "InstructorPayment" AS ENUM ('HOURLY', 'FIXED', 'COMMISSION', 'MIXED');

-- CreateEnum
CREATE TYPE "ClassType" AS ENUM ('GROUP', 'PRIVATE', 'SEMI_PRIVATE');

-- CreateEnum
CREATE TYPE "ClassLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS');

-- CreateEnum
CREATE TYPE "ClassStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EnrollmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateTable
CREATE TABLE "Instructor" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "bio" TEXT,
    "specialties" TEXT[],
    "paymentType" "InstructorPayment" NOT NULL DEFAULT 'HOURLY',
    "hourlyRate" INTEGER NOT NULL DEFAULT 0,
    "fixedSalary" INTEGER NOT NULL DEFAULT 0,
    "commissionPercent" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Instructor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Class" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "instructorId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "ClassType" NOT NULL DEFAULT 'GROUP',
    "level" "ClassLevel" NOT NULL DEFAULT 'ALL_LEVELS',
    "status" "ClassStatus" NOT NULL DEFAULT 'SCHEDULED',
    "date" TIMESTAMP(3) NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 60,
    "courtId" TEXT,
    "maxStudents" INTEGER NOT NULL DEFAULT 8,
    "currentStudents" INTEGER NOT NULL DEFAULT 0,
    "price" INTEGER NOT NULL DEFAULT 0,
    "instructorCost" INTEGER NOT NULL DEFAULT 0,
    "courtCost" INTEGER NOT NULL DEFAULT 0,
    "totalCost" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClassBooking" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "playerId" TEXT,
    "playerName" TEXT NOT NULL,
    "playerEmail" TEXT,
    "playerPhone" TEXT NOT NULL,
    "status" "EnrollmentStatus" NOT NULL DEFAULT 'CONFIRMED',
    "enrollmentDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "attended" BOOLEAN NOT NULL DEFAULT false,
    "attendanceTime" TIMESTAMP(3),
    "attendanceStatus" TEXT,
    "attendanceNotes" TEXT,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "paymentMethod" TEXT,
    "paidAmount" INTEGER NOT NULL DEFAULT 0,
    "dueAmount" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ClassBooking_pkey" PRIMARY KEY ("id")
);

-- AddColumn to ClubSettings if they don't exist
ALTER TABLE "ClubSettings" ADD COLUMN IF NOT EXISTS "groupClassPrice" INTEGER NOT NULL DEFAULT 40000;
ALTER TABLE "ClubSettings" ADD COLUMN IF NOT EXISTS "privateClassPrice" INTEGER NOT NULL DEFAULT 100000;
ALTER TABLE "ClubSettings" ADD COLUMN IF NOT EXISTS "semiPrivateClassPrice" INTEGER NOT NULL DEFAULT 70000;
ALTER TABLE "ClubSettings" ADD COLUMN IF NOT EXISTS "defaultClassDuration" INTEGER NOT NULL DEFAULT 60;
ALTER TABLE "ClubSettings" ADD COLUMN IF NOT EXISTS "defaultMaxStudents" INTEGER NOT NULL DEFAULT 8;
ALTER TABLE "ClubSettings" ADD COLUMN IF NOT EXISTS "defaultCourtCostPerHour" INTEGER NOT NULL DEFAULT 30000;
ALTER TABLE "ClubSettings" ADD COLUMN IF NOT EXISTS "allowOnlineClassBooking" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "ClubSettings" ADD COLUMN IF NOT EXISTS "requirePaymentUpfront" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "ClubSettings" ADD COLUMN IF NOT EXISTS "classBookingAdvanceDays" INTEGER NOT NULL DEFAULT 30;
ALTER TABLE "ClubSettings" ADD COLUMN IF NOT EXISTS "classCancellationHours" INTEGER NOT NULL DEFAULT 24;

-- CreateIndex
CREATE INDEX "Instructor_clubId_idx" ON "Instructor"("clubId");
CREATE INDEX "Instructor_active_idx" ON "Instructor"("active");

-- CreateIndex
CREATE INDEX "Class_clubId_idx" ON "Class"("clubId");
CREATE INDEX "Class_instructorId_idx" ON "Class"("instructorId");
CREATE INDEX "Class_courtId_idx" ON "Class"("courtId");
CREATE INDEX "Class_date_idx" ON "Class"("date");
CREATE INDEX "Class_status_idx" ON "Class"("status");

-- CreateIndex
CREATE INDEX "ClassBooking_classId_idx" ON "ClassBooking"("classId");
CREATE INDEX "ClassBooking_playerId_idx" ON "ClassBooking"("playerId");
CREATE INDEX "ClassBooking_playerPhone_idx" ON "ClassBooking"("playerPhone");

-- AddForeignKey
ALTER TABLE "Instructor" ADD CONSTRAINT "Instructor_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_instructorId_fkey" FOREIGN KEY ("instructorId") REFERENCES "Instructor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Class" ADD CONSTRAINT "Class_courtId_fkey" FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassBooking" ADD CONSTRAINT "ClassBooking_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClassBooking" ADD CONSTRAINT "ClassBooking_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;