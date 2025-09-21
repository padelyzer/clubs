-- Padelyzer Database Initialization Script
-- Este script se ejecuta automáticamente cuando Docker crea la base de datos

-- Asegurar que el usuario tenga todos los permisos necesarios
GRANT ALL PRIVILEGES ON DATABASE padelyzer_db TO padelyzer;
GRANT ALL ON SCHEMA public TO padelyzer;
ALTER SCHEMA public OWNER TO padelyzer;

-- Configurar búsqueda de esquemas
ALTER DATABASE padelyzer_db SET search_path TO public;

-- Crear extensiones útiles (opcional)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Configuración de conexiones
ALTER SYSTEM SET max_connections = 100;
ALTER SYSTEM SET shared_buffers = '256MB';

-- Log para confirmar inicialización
DO $$
BEGIN
  RAISE NOTICE 'Padelyzer DB initialized successfully at %', NOW();
END
$$;