-- Script para verificar TODOS los campos críticos en todas las tablas
-- Ejecutar en Supabase SQL Editor

-- 1. Verificar campos en Class
SELECT 'Class' as tabla, column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'Class'
AND column_name IN ('courtCost', 'instructorCost', 'id', 'updatedAt')
ORDER BY column_name;

-- 2. Verificar campos en ClassBooking
SELECT 'ClassBooking' as tabla, column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'ClassBooking'
AND column_name IN ('checkedIn', 'checkedInAt', 'id', 'updatedAt')
ORDER BY column_name;

-- 3. Verificar campos en Instructor
SELECT 'Instructor' as tabla, column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'Instructor'
AND column_name IN ('id', 'updatedAt', 'active')
ORDER BY column_name;

-- 4. Verificar campos en Court
SELECT 'Court' as tabla, column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'Court'
AND column_name IN ('id', 'updatedAt', 'active')
ORDER BY column_name;

-- 5. Verificar campos en Player
SELECT 'Player' as tabla, column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'Player'
AND column_name IN ('id', 'updatedAt')
ORDER BY column_name;

-- Resumen de conteos
SELECT
    'Class' as tabla, COUNT(*) as total_registros
FROM "Class"
UNION ALL
SELECT
    'ClassBooking' as tabla, COUNT(*) as total_registros
FROM "ClassBooking"
UNION ALL
SELECT
    'Instructor' as tabla, COUNT(*) as total_registros
FROM "Instructor"
UNION ALL
SELECT
    'Court' as tabla, COUNT(*) as total_registros
FROM "Court"
UNION ALL
SELECT
    'Player' as tabla, COUNT(*) as total_registros
FROM "Player";
