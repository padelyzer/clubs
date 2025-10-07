-- Hotfix: Asociar reservas existentes con players
-- Esto hará que las reservas funcionen con el código que está en producción

-- Primero, actualizar las reservas que ya tienen un player correspondiente
UPDATE "public"."Booking" 
SET "playerId" = p.id
FROM "public"."Player" p 
WHERE "Booking"."playerPhone" = p.phone 
  AND "Booking"."clubId" = p."clubId"
  AND "Booking"."playerId" IS NULL;

-- Crear players para las reservas que no tienen player asociado
-- y luego asociar las reservas a esos players
INSERT INTO "public"."Player" (
  id,
  "clubId",
  name,
  phone,
  "phoneVerified",
  active,
  "totalBookings",
  "totalSpent",
  "createdAt",
  "updatedAt"
)
SELECT DISTINCT
  'player_' || "clubId" || '_' || encode(digest("playerPhone", 'sha256'), 'hex'),
  "clubId",
  "playerName",
  "playerPhone",
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

-- Ahora asociar las reservas con los players recién creados
UPDATE "public"."Booking" 
SET "playerId" = p.id
FROM "public"."Player" p 
WHERE "Booking"."playerPhone" = p.phone 
  AND "Booking"."clubId" = p."clubId"
  AND "Booking"."playerId" IS NULL;