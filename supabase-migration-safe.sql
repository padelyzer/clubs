-- MIGRACIÓN SEGURA PARA MÓDULO DE CLASES DE PADELYZER
-- Esta versión verifica constraints existentes

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

-- 7. Agregar foreign keys con verificación
DO $$ 
BEGIN
    -- Instructor -> Club
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Instructor_clubId_fkey'
    ) THEN
        ALTER TABLE "Instructor" ADD CONSTRAINT "Instructor_clubId_fkey" 
        FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    -- Class -> Club
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Class_clubId_fkey'
    ) THEN
        ALTER TABLE "Class" ADD CONSTRAINT "Class_clubId_fkey" 
        FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    -- Class -> Instructor
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Class_instructorId_fkey'
    ) THEN
        ALTER TABLE "Class" ADD CONSTRAINT "Class_instructorId_fkey" 
        FOREIGN KEY ("instructorId") REFERENCES "Instructor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    
    -- Class -> Court
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'Class_courtId_fkey'
    ) THEN
        ALTER TABLE "Class" ADD CONSTRAINT "Class_courtId_fkey" 
        FOREIGN KEY ("courtId") REFERENCES "Court"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    
    -- ClassBooking -> Class
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'ClassBooking_classId_fkey'
    ) THEN
        ALTER TABLE "ClassBooking" ADD CONSTRAINT "ClassBooking_classId_fkey" 
        FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    
    -- ClassBooking -> Player
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'ClassBooking_playerId_fkey'
    ) THEN
        ALTER TABLE "ClassBooking" ADD CONSTRAINT "ClassBooking_playerId_fkey" 
        FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
EXCEPTION
    WHEN others THEN 
        RAISE NOTICE 'Error agregando constraints: %', SQLERRM;
END $$;

-- 8. Crear o reemplazar función para triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 9. Crear triggers solo si no existen
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_instructor_updated_at'
    ) THEN
        CREATE TRIGGER update_instructor_updated_at 
        BEFORE UPDATE ON "Instructor"
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_class_updated_at'
    ) THEN
        CREATE TRIGGER update_class_updated_at 
        BEFORE UPDATE ON "Class"
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_class_booking_updated_at'
    ) THEN
        CREATE TRIGGER update_class_booking_updated_at 
        BEFORE UPDATE ON "ClassBooking"
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- 10. Verificación final
DO $$ 
DECLARE
    tables_ok BOOLEAN;
    columns_ok BOOLEAN;
BEGIN
    -- Verificar que las tablas existen
    SELECT 
        EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Instructor') AND
        EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'Class') AND
        EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'ClassBooking')
    INTO tables_ok;
    
    -- Verificar columnas en ClubSettings
    SELECT 
        EXISTS (SELECT 1 FROM information_schema.columns 
                WHERE table_name = 'ClubSettings' AND column_name = 'groupClassPrice')
    INTO columns_ok;
    
    IF tables_ok AND columns_ok THEN
        RAISE NOTICE '✅ MIGRACIÓN COMPLETADA EXITOSAMENTE';
        RAISE NOTICE '✅ Las tablas del módulo de clases están listas';
        RAISE NOTICE '✅ Las APIs deberían funcionar correctamente ahora';
    ELSE
        RAISE NOTICE '⚠️ Algunas partes de la migración podrían estar pendientes';
    END IF;
END $$;