-- Hotfix súper simple: Solo asociar reservas con players existentes
-- Si no hay player, lo dejamos NULL (el código debería manejar esto)

UPDATE "public"."Booking" 
SET "playerId" = p.id
FROM "public"."Player" p 
WHERE "Booking"."playerPhone" = p.phone 
  AND "Booking"."clubId" = p."clubId"
  AND "Booking"."playerId" IS NULL;

-- Verificar resultado
SELECT 
  COUNT(*) as total_reservas,
  COUNT(CASE WHEN "playerId" IS NOT NULL THEN 1 END) as con_player_id,
  COUNT(CASE WHEN "playerId" IS NULL THEN 1 END) as sin_player_id
FROM "public"."Booking";