-- Script para agregar campos faltantes a la tabla ClassBooking
-- Ejecutar en Supabase SQL Editor

-- Verificar campos existentes (opcional)
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'ClassBooking'
AND column_name IN ('checkedIn', 'checkedInAt');

-- Agregar campos si no existen
DO $$
BEGIN
    -- Agregar checkedIn si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ClassBooking' AND column_name = 'checkedIn'
    ) THEN
        ALTER TABLE "ClassBooking" ADD COLUMN "checkedIn" BOOLEAN NOT NULL DEFAULT false;
        RAISE NOTICE 'Campo checkedIn agregado exitosamente';
    ELSE
        RAISE NOTICE 'Campo checkedIn ya existe';
    END IF;

    -- Agregar checkedInAt si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'ClassBooking' AND column_name = 'checkedInAt'
    ) THEN
        ALTER TABLE "ClassBooking" ADD COLUMN "checkedInAt" TIMESTAMP(3);
        RAISE NOTICE 'Campo checkedInAt agregado exitosamente';
    ELSE
        RAISE NOTICE 'Campo checkedInAt ya existe';
    END IF;
END $$;

-- Verificar que los campos se agregaron correctamente
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'ClassBooking'
AND column_name IN ('checkedIn', 'checkedInAt')
ORDER BY column_name;

-- Contar registros en la tabla ClassBooking
SELECT COUNT(*) as total_class_bookings FROM "ClassBooking";
