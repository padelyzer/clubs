-- MIGRACIÓN PARA MÓDULO DE CLASES DE PADELYZER
-- Ejecutar este SQL en Supabase SQL Editor

-- 1. Crear tipos ENUM si no existen
DO $$ BEGIN
    CREATE TYPE "InstructorPayment" AS ENUM ('HOURLY', 'FIXED', 'COMMISSION', 'MIXED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ClassType" AS ENUM ('GROUP', 'PRIVATE', 'SEMI_PRIVATE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ClassLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'ALL_LEVELS');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ClassStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "EnrollmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Crear tabla Instructor
CREATE TABLE IF NOT EXISTS "Instructor" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "clubId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "bio" TEXT,
    "specialties" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "paymentType" "InstructorPayment" NOT NULL DEFAULT 'HOURLY',
    "hourlyRate" INTEGER NOT NULL DEFAULT 0,
    "fixedSalary" INTEGER NOT NULL DEFAULT 0,
    "commissionPercent" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Instructor_pkey" PRIMARY KEY ("id")
);

-- 3. Crear tabla Class
CREATE TABLE IF NOT EXISTS "Class" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Class_pkey" PRIMARY KEY ("id")
);

-- 4. Crear tabla ClassBooking
CREATE TABLE IF NOT EXISTS "ClassBooking" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
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
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ClassBooking_pkey" PRIMARY KEY ("id")
);

-- 5. Agregar columnas a ClubSettings
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

-- 6. Crear índices
CREATE INDEX IF NOT EXISTS "Instructor_clubId_idx" ON "Instructor"("clubId");
CREATE INDEX IF NOT EXISTS "Instructor_active_idx" ON "Instructor"("active");
CREATE INDEX IF NOT EXISTS "Class_clubId_idx" ON "Class"("clubId");
CREATE INDEX IF NOT EXISTS "Class_instructorId_idx" ON "Class"("instructorId");
CREATE INDEX IF NOT EXISTS "Class_courtId_idx" ON "Class"("courtId");
CREATE INDEX IF NOT EXISTS "Class_date_idx" ON "Class"("date");
CREATE INDEX IF NOT EXISTS "Class_status_idx" ON "Class"("status");
CREATE INDEX IF NOT EXISTS "ClassBooking_classId_idx" ON "ClassBooking"("classId");
CREATE INDEX IF NOT EXISTS "ClassBooking_playerId_idx" ON "ClassBooking"("playerId");
CREATE INDEX IF NOT EXISTS "ClassBooking_playerPhone_idx" ON "ClassBooking"("playerPhone");

-- 7. Agregar foreign keys solo si las tablas referenciadas existen
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Club') THEN
        ALTER TABLE "Instructor" ADD CONSTRAINT "Instructor_clubId_fkey" 
        FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
        
        ALTER TABLE "Class" ADD CONSTRAINT "Class_clubId_fkey" 
        FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Court') THEN
        ALTER TABLE "Class" ADD CONSTRAINT "Class_courtId_fkey" 
        FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Player') THEN
        ALTER TABLE "ClassBooking" ADD CONSTRAINT "ClassBooking_playerId_fkey" 
        FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END $$;

-- 8. Agregar relaciones entre las nuevas tablas
ALTER TABLE "Class" ADD CONSTRAINT "Class_instructorId_fkey" 
FOREIGN KEY ("instructorId") REFERENCES "Instructor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "ClassBooking" ADD CONSTRAINT "ClassBooking_classId_fkey" 
FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 9. Crear triggers para actualizar updatedAt
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_instructor_updated_at BEFORE UPDATE ON "Instructor"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_class_updated_at BEFORE UPDATE ON "Class"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_class_booking_updated_at BEFORE UPDATE ON "ClassBooking"
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- MIGRACIÓN COMPLETADA ✅
-- Las APIs del módulo de clases ahora deberían funcionar correctamente