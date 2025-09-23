-- Crear superadmin directamente en la base de datos
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
  'super-admin-001',
  'admin@padelyzer.com',
  'Super Admin',
  '$2b$10$YIqsFIwSZ6a7xLng9GAIg.uFGds7h2HexxXOrHu6FL0Won0l/g5dW',
  'SUPER_ADMIN',
  true,
  NOW(),
  NOW(),
  NOW()
) 
ON CONFLICT (email) 
DO UPDATE SET 
  password = '$2b$10$YIqsFIwSZ6a7xLng9GAIg.uFGds7h2HexxXOrHu6FL0Won0l/g5dW',
  role = 'SUPER_ADMIN',
  active = true,
  "updatedAt" = NOW();