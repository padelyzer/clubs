-- Crear players para las 4 reservas que no tienen playerId
-- Usamos una estrategia diferente para evitar conflictos

-- Ver qué reservas no tienen playerId
SELECT 
  "clubId",
  "playerName", 
  "playerPhone",
  "playerEmail"
FROM "public"."Booking" 
WHERE "playerId" IS NULL;

-- Crear players únicos usando un ID más simple
INSERT INTO "public"."Player" (
  id,
  "clubId",
  name,
  phone,
  email,
  "phoneVerified",
  active,
  "totalBookings",
  "totalSpent",
  "createdAt",
  "updatedAt"
)
SELECT DISTINCT
  'player_' || ROW_NUMBER() OVER() || '_' || extract(epoch from now())::bigint,
  "clubId",
  "playerName",
  "playerPhone",
  "playerEmail",
  false,
  true,
  0,
  0,
  NOW(),
  NOW()
FROM "public"."Booking"
WHERE "playerId" IS NULL
  AND "playerPhone" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "public"."Player" p 
    WHERE p.phone = "Booking"."playerPhone" 
    AND p."clubId" = "Booking"."clubId"
  );

-- Ahora asociar las reservas
UPDATE "public"."Booking" 
SET "playerId" = p.id
FROM "public"."Player" p 
WHERE "Booking"."playerPhone" = p.phone 
  AND "Booking"."clubId" = p."clubId"
  AND "Booking"."playerId" IS NULL;