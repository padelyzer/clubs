-- Script para agregar campos faltantes a la tabla Class
-- Ejecutar en Supabase SQL Editor

-- Verificar campos existentes (opcional, solo para ver el estado actual)
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'Class' 
AND column_name IN ('courtCost', 'instructorCost');

-- Agregar campos si no existen
DO $$ 
BEGIN
    -- Agregar courtCost si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Class' AND column_name = 'courtCost'
    ) THEN
        ALTER TABLE "Class" ADD COLUMN "courtCost" INTEGER NOT NULL DEFAULT 0;
        RAISE NOTICE 'Campo courtCost agregado exitosamente';
    ELSE
        RAISE NOTICE 'Campo courtCost ya existe';
    END IF;

    -- Agregar instructorCost si no existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'Class' AND column_name = 'instructorCost'
    ) THEN
        ALTER TABLE "Class" ADD COLUMN "instructorCost" INTEGER NOT NULL DEFAULT 0;
        RAISE NOTICE 'Campo instructorCost agregado exitosamente';
    ELSE
        RAISE NOTICE 'Campo instructorCost ya existe';
    END IF;
END $$;

-- Verificar que los campos se agregaron correctamente
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'Class' 
AND column_name IN ('courtCost', 'instructorCost');

-- Contar registros en la tabla Class (para verificar que todo sigue funcionando)
SELECT COUNT(*) as total_classes FROM "Class";
