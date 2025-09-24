-- Create split payments for Carlos López
INSERT INTO "SplitPayment" (
  id, 
  "bookingId",
  amount,
  status,
  "playerName",
  "playerEmail",
  "playerPhone",
  "createdAt",
  "updatedAt"
) VALUES 
  ('split_carlos_1', '4460e364-6ef7-43b0-a114-2325cc24d36c', 20000, 'pending', 'Carlos López', 'carlos@example.com', '+52 222 987 6543', NOW(), NOW()),
  ('split_carlos_2', '4460e364-6ef7-43b0-a114-2325cc24d36c', 20000, 'pending', 'Jugador 2', NULL, NULL, NOW(), NOW()),
  ('split_carlos_3', '4460e364-6ef7-43b0-a114-2325cc24d36c', 20000, 'pending', 'Jugador 3', NULL, NULL, NOW(), NOW()),
  ('split_carlos_4', '4460e364-6ef7-43b0-a114-2325cc24d36c', 20000, 'pending', 'Jugador 4', NULL, NULL, NOW(), NOW());

-- Create split payments for María González
INSERT INTO "SplitPayment" (
  id, 
  "bookingId",
  amount,
  status,
  "playerName",
  "playerEmail",
  "playerPhone",
  "createdAt",
  "updatedAt"
) VALUES 
  ('split_maria_1', 'db59b0a3-6fc4-44a5-9e4e-8fe49b476a2b', 20000, 'pending', 'María González', 'maria@example.com', '+52 222 456 7890', NOW(), NOW()),
  ('split_maria_2', 'db59b0a3-6fc4-44a5-9e4e-8fe49b476a2b', 20000, 'pending', 'Jugador 2', NULL, NULL, NOW(), NOW()),
  ('split_maria_3', 'db59b0a3-6fc4-44a5-9e4e-8fe49b476a2b', 20000, 'pending', 'Jugador 3', NULL, NULL, NOW(), NOW()),
  ('split_maria_4', 'db59b0a3-6fc4-44a5-9e4e-8fe49b476a2b', 20000, 'pending', 'Jugador 4', NULL, NULL, NOW(), NOW());