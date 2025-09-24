-- Script para resetear la contraseña de admin@padelyzer.com
-- Nueva contraseña: Admin2024!

-- 1. Verificar que el usuario existe
SELECT id, email, role, active 
FROM "User" 
WHERE email = 'admin@padelyzer.com';

-- 2. Actualizar la contraseña
UPDATE "User" 
SET 
  password = '$2b$10$qQW/RSAb4sH9X..P4mqpL.KeaRHRcOQPX6WNzTqA3QuEQBOLvXsqq',
  "updatedAt" = NOW()
WHERE email = 'admin@padelyzer.com';

-- 3. Si el usuario NO existe, créalo
/*
INSERT INTO "User" (
  id,
  email,
  name,
  password,
  role,
  active,
  "emailVerified",
  "createdAt",
  "updatedAt"
) VALUES (
  gen_random_uuid(),
  'admin@padelyzer.com',
  'Super Admin',
  '$2b$10$X5zXvKwJV5tB.x9TwqEUn.BhgL3x.7FhZHxYkzqT0lXkBhZJzFPeG',
  'SUPER_ADMIN',
  true,
  NOW(),
  NOW(),
  NOW()
);
*/

-- Credenciales actualizadas:
-- Email: admin@padelyzer.com
-- Contraseña: Admin2024!
-- URL: https://www.padelyzer.app/admin