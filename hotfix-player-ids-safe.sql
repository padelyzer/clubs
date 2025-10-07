-- Hotfix seguro: Asociar reservas existentes con players
-- Maneja duplicados y conflictos

-- Paso 1: Actualizar las reservas que ya tienen un player correspondiente
UPDATE "public"."Booking" 
SET "playerId" = p.id
FROM "public"."Player" p 
WHERE "Booking"."playerPhone" = p.phone 
  AND "Booking"."clubId" = p."clubId"
  AND "Booking"."playerId" IS NULL;

-- Paso 2: Para las reservas sin player, crear players solo si no existen
-- Usamos ON CONFLICT DO NOTHING para evitar duplicados
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
ON CONFLICT (id) DO NOTHING;

-- Paso 3: Asociar las reservas restantes con players existentes
UPDATE "public"."Booking" 
SET "playerId" = p.id
FROM "public"."Player" p 
WHERE "Booking"."playerPhone" = p.phone 
  AND "Booking"."clubId" = p."clubId"
  AND "Booking"."playerId" IS NULL;

-- Verificación: Mostrar cuántas reservas aún no tienen playerId
SELECT 
  COUNT(*) as reservas_sin_player_id,
  COUNT(CASE WHEN "playerId" IS NOT NULL THEN 1 END) as reservas_con_player_id
FROM "public"."Booking";